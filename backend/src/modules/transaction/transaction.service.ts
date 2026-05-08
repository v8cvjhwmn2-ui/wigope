import { Types } from "mongoose";

import { Err } from "../../utils/errors";
import { receiptPdf } from "./receipt-pdf";
import { TransactionModel } from "./transaction.model";

const statuses = ["initiated", "pending", "success", "failed", "refunded"];
const types = ["recharge", "deposit", "refund", "cashback", "dmt"];

export const transactionService = {
  async list(
    userId: string,
    input: { status?: string; type?: string; limit?: number },
  ) {
    const query: Record<string, unknown> = { userId };
    if (input.status && statuses.includes(input.status)) {
      query.status = input.status;
    }
    if (input.type && types.includes(input.type)) {
      query.type = input.type;
    }
    const rows = await TransactionModel.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(Math.max(input.limit ?? 30, 1), 100))
      .lean();
    return rows.map(serialize);
  },

  async detail(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) throw Err.userNotFound();
    const txn = await TransactionModel.findOne({
      _id: new Types.ObjectId(id),
      userId,
    }).lean();
    if (!txn) throw Err.userNotFound();
    return serialize(txn);
  },

  async receipt(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) throw Err.userNotFound();
    const txn = await TransactionModel.findOne({
      _id: new Types.ObjectId(id),
      userId,
    });
    if (!txn) throw Err.userNotFound();
    return receiptPdf(txn.toObject() as Parameters<typeof receiptPdf>[0]);
  },
};

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
