import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const transactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['recharge', 'deposit', 'refund', 'cashback', 'dmt'],
      required: true,
      index: true,
    },
    service: {
      type: String,
      enum: [
        'mobile_prepaid',
        'mobile_postpaid',
        'dth',
        'electricity',
        'fastag',
        'lpg',
        'water',
        'broadband',
        'insurance',
        'education',
        'municipality',
        'google_play',
        'rent',
        'wallet_topup',
        'dmt',
      ],
    },
    operator: { type: String },
    circle: { type: String },
    recipient: { type: String }, // mobile / consumer id / beneficiary
    amount: { type: Number, required: true },
    cashbackAmount: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },
    paymentMode: { type: String, enum: ['wallet', 'upi', 'card', 'netbanking'], required: true },
    gatewayOrderId: { type: String, index: true },
    gatewayPaymentId: { type: String, index: true },
    a1topupTxnId: { type: String, index: true },
    status: {
      type: String,
      enum: ['initiated', 'pending', 'success', 'failed', 'refunded'],
      default: 'initiated',
      index: true,
    },
    failureReason: { type: String },
    completedAt: { type: Date },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });

export type Transaction = InferSchemaType<typeof transactionSchema>;
export const TransactionModel = model('Transaction', transactionSchema);
