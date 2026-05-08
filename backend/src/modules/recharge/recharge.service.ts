import { Types, type HydratedDocument } from "mongoose";
import { z } from "zod";

import { env } from "../../config/env";
import { Err } from "../../utils/errors";
import { notificationService } from "../notification/notification.service";
import {
  TransactionModel,
  type Transaction,
} from "../transaction/transaction.model";
import { walletService } from "../wallet/wallet.service";
import { getRechargeProvider } from "./providers";
import type {
  ProviderStatus,
  RechargeResult,
} from "./providers/recharge-provider.interface";

const provider = getRechargeProvider();
type RechargeTxnDoc = HydratedDocument<Transaction>;

export const mobileRechargeSchema = z.object({
  number: z.string().regex(/^\d{10}$/),
  amount: z.coerce.number().min(1),
  paymentMode: z.enum(["wallet"]).default("wallet"),
});

export const fetchBillSchema = z.object({
  opid: z.string().min(1),
  number: z.string().min(3),
  mobile: z.string().regex(/^(\+91)?[6-9]\d{9}$/),
  opt1to10: z.record(z.string()).optional(),
});

export const billPaymentSchema = fetchBillSchema.extend({
  amount: z.coerce.number().min(1),
  service: z.string().default("bill_payment"),
  billRefId: z.string().optional(),
});

export const rechargeService = {
  async services() {
    return provider.fetchServiceCategories();
  },

  async operators(service?: string) {
    return provider.fetchOperators(service);
  },

  async circles() {
    return provider.fetchCircles();
  },

  async refreshCatalog() {
    const [services, operators, circles] = await Promise.all([
      provider.fetchServiceCategories(),
      provider.fetchOperators(),
      provider.fetchCircles(),
    ]);
    return {
      services,
      operators,
      circles,
      refreshedAt: new Date().toISOString(),
    };
  },

  async detectOperator(number: string) {
    return provider.detectOperator(normalizeMobile(number));
  },

  async mobilePlans(opid: string, circle: string) {
    return provider.fetchMobilePlans(opid, circle);
  },

  async dthPlans(opid: string) {
    return provider.fetchDthPlans(opid);
  },

  async rOffers(opid: string, mobile: string) {
    return provider.fetchROffers(opid, normalizeMobile(mobile));
  },

  async fetchBill(input: z.infer<typeof fetchBillSchema>) {
    return provider.fetchBill({
      opid: input.opid,
      number: input.number,
      mobile: normalizeMobile(input.mobile),
      opt1to10: input.opt1to10,
      orderId: generateOrderId("BIL"),
    });
  },

  async initiateMobileRecharge(
    userId: string,
    input: z.infer<typeof mobileRechargeSchema>,
  ) {
    const amount = normalizeAmount(input.amount);
    validateAmount(amount);

    const number = normalizeMobile(input.number);
    const orderId = generateOrderId("RCG");
    const detection = await provider.detectOperator(number);
    if (env.SKIP_INFRA_CONNECT) {
      return submitDevUatRecharge({
        orderId,
        opid: detection.opid,
        number,
        amount,
        operator: detection.operatorName,
        circle: detection.circleName,
      });
    }

    await enforceDailyLimit(userId, amount);

    const txn = (await TransactionModel.create({
      userId: new Types.ObjectId(userId),
      type: "recharge",
      service: "mobile_prepaid",
      operator: detection.operatorName,
      circle: detection.circleName,
      recipient: number,
      amount,
      paymentMode: "wallet",
      gatewayOrderId: orderId,
      status: "initiated",
      meta: {
        provider: provider.name,
        orderId,
        opid: detection.opid,
        circleCode: detection.circleCode,
      },
    })) as RechargeTxnDoc;

    try {
      const debit = await walletService.debit({
        userId,
        amount,
        source: "recharge",
        refType: "recharge_txn",
        refId: orderId,
        note: `Mobile recharge - ${detection.operatorName} ${number}`,
      });

      txn.status = "pending";
      txn.meta = {
        ...(txn.meta as Record<string, unknown>),
        walletDebitId: String(debit._id),
      };
      await txn.save();
    } catch (error) {
      txn.status = "failed";
      txn.failureReason =
        error instanceof Error ? error.message : "Wallet debit failed";
      await txn.save();
      throw error;
    }

    try {
      const result = await provider.doRecharge({
        opid: detection.opid,
        number,
        amount,
        orderId,
      });
      await settleProviderResult(txn, userId, result);
      return serializeRecharge(txn);
    } catch (error) {
      txn.status = "pending";
      txn.failureReason =
        error instanceof Error ? error.message : "Provider pending";
      await txn.save();
      return serializeRecharge(txn);
    }
  },

  async initiateDthRecharge(
    userId: string,
    input: z.infer<typeof mobileRechargeSchema>,
  ) {
    return this.initiateMobileRecharge(userId, input);
  },

  async initiateBillPayment(
    userId: string,
    input: z.infer<typeof billPaymentSchema>,
  ) {
    const amount = normalizeAmount(input.amount);
    validateAmount(amount);

    if (env.SKIP_INFRA_CONNECT) {
      return serializeDevGenericRecharge({
        orderId: generateOrderId("BIL"),
        service: mapService(input.service),
        operator: input.opid,
        recipient: input.number,
        amount,
      });
    }

    await enforceDailyLimit(userId, amount);

    const orderId = generateOrderId("BIL");
    const txn = (await TransactionModel.create({
      userId: new Types.ObjectId(userId),
      type: "recharge",
      service: mapService(input.service),
      operator: input.opid,
      recipient: input.number,
      amount,
      paymentMode: "wallet",
      gatewayOrderId: orderId,
      status: "initiated",
      meta: {
        provider: provider.name,
        orderId,
        opid: input.opid,
        billRefId: input.billRefId,
      },
    })) as RechargeTxnDoc;

    const debit = await walletService.debit({
      userId,
      amount,
      source: "recharge",
      refType: "bill_payment_txn",
      refId: orderId,
      note: `${input.service} bill payment - ${input.number}`,
    });
    txn.status = "pending";
    txn.meta = {
      ...(txn.meta as Record<string, unknown>),
      walletDebitId: String(debit._id),
    };
    await txn.save();

    try {
      const result = await provider.doBillPayment({
        opid: input.opid,
        number: input.number,
        amount,
        orderId,
        refrenceId: input.billRefId,
        opt1to10: input.opt1to10,
        mobile: normalizeMobile(input.mobile),
      });
      await settleProviderResult(txn, userId, result);
    } catch (error) {
      txn.failureReason =
        error instanceof Error ? error.message : "Provider pending";
      await txn.save();
    }
    return serializeRecharge(txn);
  },

  async transactions(
    userId: string,
    filter: { status?: string; service?: string; limit?: number },
  ) {
    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      type: "recharge",
    };
    if (filter.status) query.status = filter.status;
    if (filter.service) query.service = filter.service;
    const rows = await TransactionModel.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(Math.max(Number(filter.limit ?? 30), 1), 100))
      .lean();
    return rows.map((row) => ({
      id: String(row._id),
      orderId: row.gatewayOrderId,
      service: row.service,
      operator: row.operator,
      recipient: row.recipient,
      amount: row.amount,
      cashbackAmount: row.cashbackAmount,
      status: row.status,
      failureReason: row.failureReason ?? null,
      createdAt: row.createdAt,
      completedAt: row.completedAt ?? null,
    }));
  },

  async transaction(userId: string, orderId: string) {
    const orQuery: Array<Record<string, unknown>> = [
      { gatewayOrderId: orderId },
    ];
    if (Types.ObjectId.isValid(orderId))
      orQuery.push({ _id: new Types.ObjectId(orderId) });
    const txn = await TransactionModel.findOne({
      userId: new Types.ObjectId(userId),
      $or: orQuery,
    });
    if (!txn) throw Err.rechargeNotFound();
    return serializeRecharge(txn);
  },

  async pollStatus(userId: string, orderId: string) {
    const txn = await TransactionModel.findOne({
      userId: new Types.ObjectId(userId),
      gatewayOrderId: orderId,
      type: "recharge",
    });
    if (!txn) throw Err.rechargeNotFound();
    if (txn.status === "success" || txn.status === "refunded")
      return serializeRecharge(txn);

    const result = await provider.getTransactionStatus(orderId);
    await settleProviderResult(txn, userId, result);
    return serializeRecharge(txn);
  },

  async handleWebhook(rawBody: string, signature?: string) {
    if (!provider.verifyWebhookSignature(rawBody, signature)) {
      throw Err.forbidden();
    }
    const event = provider.parseWebhookEvent(rawBody);
    if (env.SKIP_INFRA_CONNECT)
      return { accepted: true, matched: false, localDev: true };

    const txn = await TransactionModel.findOne({
      gatewayOrderId: event.orderId,
      type: "recharge",
    });
    if (!txn) return { accepted: true, matched: false };
    await settleProviderResult(txn, String(txn.userId), {
      status: event.status,
      providerTxnId: event.providerTxnId,
      message: event.message,
      raw: event.raw,
    });
    return { accepted: true, matched: true };
  },
};

async function settleProviderResult(
  txn: RechargeTxnDoc,
  userId: string,
  result: RechargeResult,
) {
  const meta = {
    ...(txn.meta as Record<string, unknown>),
    providerResponse: result.raw,
    providerTxnId: result.providerTxnId,
  };
  txn.meta = meta;

  if (result.status === "SUCCESS") {
    txn.status = "success";
    txn.completedAt = new Date();
    txn.failureReason = undefined;
    await txn.save();
    await notificationService.create({
      userId,
      type: "recharge_success",
      title: "Recharge successful",
      body: `₹${txn.amount} recharge completed for ${txn.recipient}`,
      data: { orderId: txn.gatewayOrderId, service: txn.service },
    });
    return;
  }

  if (result.status === "FAILURE") {
    await refundFailed(
      txn,
      userId,
      result.message ?? "Provider rejected the transaction",
    );
    return;
  }

  txn.status = "pending";
  txn.failureReason = result.message;
  await txn.save();
}

async function refundFailed(
  txn: RechargeTxnDoc,
  userId: string,
  reason: string,
) {
  if (
    txn.status === "refunded" ||
    (txn.meta as Record<string, unknown>)?.walletRefundId
  )
    return;
  const refund = await walletService.credit({
    userId,
    amount: txn.amount,
    source: "refund",
    refType: "recharge_txn",
    refId: txn.gatewayOrderId ?? String(txn._id),
    note: `Refund - ${txn.operator ?? txn.service} failed`,
  });
  txn.status = "refunded";
  txn.failureReason = reason;
  txn.completedAt = new Date();
  txn.meta = {
    ...(txn.meta as Record<string, unknown>),
    walletRefundId: String(refund._id),
  };
  await txn.save();
  await notificationService.create({
    userId,
    type: "recharge_failed",
    title: "Recharge failed - refunded",
    body: `₹${txn.amount} refunded to your wallet`,
    data: { orderId: txn.gatewayOrderId, reason },
  });
}

async function enforceDailyLimit(userId: string, amount: number) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const rows = await TransactionModel.find({
    userId: new Types.ObjectId(userId),
    type: "recharge",
    status: { $in: ["pending", "success"] },
    createdAt: { $gte: since },
  }).select("amount");
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  if (total + amount > env.RECHARGE_DAILY_LIMIT) {
    throw Err.validation(
      `Daily recharge limit is ₹${env.RECHARGE_DAILY_LIMIT}`,
    );
  }
}

function normalizeMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  const mobile = digits.length > 10 ? digits.slice(-10) : digits;
  const pattern =
    env.KWIKAPI_ENVIRONMENT === "uat" ? /^\d{10}$/ : /^[6-9]\d{9}$/;
  if (!pattern.test(mobile))
    throw Err.validation("Enter a valid 10-digit mobile number");
  return mobile;
}

function normalizeAmount(amount: number) {
  return Math.round(Number(amount) * 100) / 100;
}

function validateAmount(amount: number) {
  if (
    !Number.isFinite(amount) ||
    amount < env.RECHARGE_MIN_AMOUNT ||
    amount > env.RECHARGE_MAX_AMOUNT
  ) {
    throw Err.amountOutOfRange(
      env.RECHARGE_MIN_AMOUNT,
      env.RECHARGE_MAX_AMOUNT,
    );
  }
}

function generateOrderId(prefix: string) {
  void prefix;
  return `${Date.now()}${Math.floor(10000 + Math.random() * 90000)}`;
}

function serializeRecharge(txn: RechargeTxnDoc) {
  return {
    id: String(txn._id),
    orderId: txn.gatewayOrderId,
    service: txn.service,
    operator: txn.operator,
    circle: txn.circle,
    recipient: txn.recipient,
    amount: txn.amount,
    status: txn.status as ProviderStatus | string,
    failureReason: txn.failureReason ?? null,
    cashbackAmount: txn.cashbackAmount,
    providerTxnId: (txn.meta as Record<string, unknown>)?.providerTxnId ?? null,
    createdAt: txn.createdAt,
    completedAt: txn.completedAt ?? null,
  };
}

async function submitDevUatRecharge(input: {
  orderId: string;
  opid: string;
  number: string;
  amount: number;
  operator: string;
  circle: string;
}) {
  try {
    const result = await provider.doRecharge({
      opid: input.opid,
      number: input.number,
      amount: input.amount,
      orderId: input.orderId,
    });
    return serializeDevRecharge(input, result);
  } catch (error) {
    return serializeDevRecharge(input, {
      status: "PENDING",
      message: error instanceof Error ? error.message : "Provider pending",
    });
  }
}

function serializeDevRecharge(
  input: {
    orderId: string;
    number: string;
    amount: number;
    operator: string;
    circle: string;
  },
  result: RechargeResult,
) {
  const status =
    result.status === "SUCCESS"
      ? "success"
      : result.status === "FAILURE"
        ? "failed"
        : "pending";
  return {
    id: input.orderId,
    orderId: input.orderId,
    service: "mobile_prepaid",
    operator: input.operator,
    circle: input.circle,
    recipient: input.number,
    amount: input.amount,
    status,
    failureReason:
      status === "failed"
        ? (result.message ?? "Provider rejected transaction")
        : null,
    cashbackAmount: 0,
    providerTxnId: result.providerTxnId ?? null,
    createdAt: new Date(),
    completedAt: status === "pending" ? null : new Date(),
    uatNoWalletSettlement: true,
  };
}

function serializeDevGenericRecharge(input: {
  orderId: string;
  service: string;
  operator: string;
  recipient: string;
  amount: number;
}) {
  return {
    id: input.orderId,
    orderId: input.orderId,
    service: input.service,
    operator: input.operator,
    circle: null,
    recipient: input.recipient,
    amount: input.amount,
    status: "pending",
    failureReason: null,
    cashbackAmount: 0,
    providerTxnId: null,
    createdAt: new Date(),
    completedAt: null,
    uatNoWalletSettlement: true,
  };
}

function mapService(service: string) {
  const key = service.toLowerCase();
  if (key.includes("postpaid")) return "mobile_postpaid";
  if (key.includes("dth")) return "dth";
  if (key.includes("electric")) return "electricity";
  if (key.includes("fastag")) return "fastag";
  if (key.includes("gas")) return "lpg";
  if (key.includes("water")) return "water";
  if (key.includes("broadband")) return "broadband";
  if (key.includes("insurance")) return "insurance";
  if (key.includes("credit")) return "wallet_topup";
  return "electricity";
}
