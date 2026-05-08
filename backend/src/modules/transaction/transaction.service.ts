import { Types } from "mongoose";

import { env } from "../../config/env";
import { Err } from "../../utils/errors";
import { notificationService } from "../notification/notification.service";
import { receiptPdf } from "./receipt-pdf";
import { TransactionModel } from "./transaction.model";

const statuses = ["initiated", "pending", "success", "failed", "refunded"];
const types = ["recharge", "deposit", "refund", "cashback", "dmt"];

export const transactionService = {
  async list(
    userId: string,
    input: { status?: string; type?: string; limit?: number },
  ) {
    if (env.SKIP_INFRA_CONNECT) {
      return mockTransactions()
        .filter((txn) => {
          if (input.status && txn.status !== input.status) return false;
          if (input.type && txn.type !== input.type) return false;
          return true;
        })
        .slice(0, Math.min(Math.max(input.limit ?? 30, 1), 100));
    }
    const query: Record<string, unknown> = { userId };
    if (input.status && statuses.includes(input.status))
      query.status = input.status;
    if (input.type && types.includes(input.type)) query.type = input.type;
    const rows = await TransactionModel.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(Math.max(input.limit ?? 30, 1), 100))
      .lean();
    return rows.map(serialize);
  },

  async detail(userId: string, id: string) {
    if (env.SKIP_INFRA_CONNECT) {
      const txn = mockTransactions().find((row) => row.id === id);
      if (!txn) throw Err.userNotFound();
      return txn;
    }
    const txn = await TransactionModel.findOne({
      _id: new Types.ObjectId(id),
      userId,
    }).lean();
    if (!txn) throw Err.userNotFound();
    return serialize(txn);
  },

  async receipt(userId: string, id: string) {
    if (env.SKIP_INFRA_CONNECT) {
      const txn =
        mockTransactions().find((row) => row.id === id) ??
        mockTransactions()[0];
      return receiptPdf({
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        type: txn.type,
        service: txn.service,
        operator: txn.operator,
        recipient: txn.recipient,
        amount: txn.amount,
        cashbackAmount: txn.cashbackAmount,
        commissionAmount: txn.commissionAmount,
        paymentMode: txn.paymentMode,
        status: txn.status,
        failureReason: txn.failureReason,
        completedAt: txn.completedAt,
        createdAt: txn.createdAt,
        updatedAt: txn.updatedAt,
        meta: txn.meta,
      } as Parameters<typeof receiptPdf>[0]);
    }
    const txn = await TransactionModel.findOne({
      _id: new Types.ObjectId(id),
      userId,
    });
    if (!txn) throw Err.userNotFound();
    return receiptPdf(txn.toObject() as Parameters<typeof receiptPdf>[0]);
  },

  async createMockEvent(
    userId: string,
    kind: "success" | "failure" | "cashback",
  ) {
    if (env.SKIP_INFRA_CONNECT) {
      return (
        mockTransactions().find((txn) =>
          kind === "cashback"
            ? txn.type === "cashback"
            : txn.status === (kind === "success" ? "success" : "failed"),
        ) ?? mockTransactions()[0]
      );
    }

    if (kind === "cashback") {
      const txn = await TransactionModel.create({
        userId,
        type: "cashback",
        service: "wallet_topup",
        amount: 10,
        paymentMode: "wallet",
        status: "success",
        cashbackAmount: 10,
        completedAt: new Date(),
        meta: { source: "phase6_mock" },
      });
      await notificationService.create({
        userId,
        type: "cashback_credit",
        title: "Cashback credited",
        body: "₹10 cashback has been credited to your Wigope wallet.",
        data: { transactionId: String(txn._id) },
      });
      return serialize(txn.toObject());
    }

    const success = kind === "success";
    const txn = await TransactionModel.create({
      userId,
      type: "recharge",
      service: "mobile_prepaid",
      operator: "Jio",
      recipient: "9568654684",
      amount: 199,
      paymentMode: "wallet",
      status: success ? "success" : "failed",
      failureReason: success ? undefined : "Operator timeout",
      completedAt: new Date(),
      meta: { source: "phase6_mock" },
    });
    await notificationService.create({
      userId,
      type: success ? "recharge_success" : "recharge_failed",
      title: success ? "Recharge successful" : "Recharge failed",
      body: success
        ? "Your Jio recharge of ₹199 is successful."
        : "Your Jio recharge of ₹199 failed. Amount will be refunded if debited.",
      data: { transactionId: String(txn._id) },
    });
    return serialize(txn.toObject());
  },
};

function mockTransactions() {
  const now = new Date();
  const earlier = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return [
    {
      id: "dev_txn_mobile_199",
      type: "recharge",
      service: "mobile_prepaid",
      operator: "Jio",
      recipient: "9568654684",
      amount: 199,
      cashbackAmount: 0,
      commissionAmount: 0,
      paymentMode: "wallet",
      gatewayOrderId: "DEV199",
      gatewayPaymentId: null,
      a1topupTxnId: null,
      status: "success",
      failureReason: null,
      completedAt: earlier,
      createdAt: earlier,
      updatedAt: earlier,
      meta: { source: "local_dev" },
    },
    {
      id: "dev_txn_fastag_500",
      type: "recharge",
      service: "fastag",
      operator: "FASTag",
      recipient: "UP16AB1234",
      amount: 500,
      cashbackAmount: 0,
      commissionAmount: 0,
      paymentMode: "wallet",
      gatewayOrderId: "DEV500",
      gatewayPaymentId: null,
      a1topupTxnId: null,
      status: "failed",
      failureReason: "UAT provider declined this sample transaction",
      completedAt: now,
      createdAt: now,
      updatedAt: now,
      meta: { source: "local_dev" },
    },
  ];
}

function serialize(row: Record<string, any>) {
  return {
    id: String(row._id),
    type: row.type,
    service: row.service ?? null,
    operator: row.operator ?? null,
    recipient: row.recipient ?? null,
    amount: row.amount,
    cashbackAmount: row.cashbackAmount ?? 0,
    commissionAmount: row.commissionAmount ?? 0,
    paymentMode: row.paymentMode,
    gatewayOrderId: row.gatewayOrderId ?? null,
    gatewayPaymentId: row.gatewayPaymentId ?? null,
    a1topupTxnId: row.a1topupTxnId ?? null,
    status: row.status,
    failureReason: row.failureReason ?? null,
    completedAt: row.completedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    meta: row.meta ?? null,
  };
}
