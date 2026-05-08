import { Schema, model, type InferSchemaType, Types } from 'mongoose';

// Wallet balance is a materialized projection.
// Source of truth is WalletLedger (append-only).
const walletSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    balance: { type: Number, default: 0 },
    lockedBalance: { type: Number, default: 0 },
    lifetimeAdded: { type: Number, default: 0 },
    lifetimeSpent: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const ledgerSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true, min: 0 },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    source: {
      type: String,
      enum: [
        'add_money',
        'recharge',
        'refund',
        'cashback',
        'commission',
        'admin_adjust',
        'hubble_rewards',
      ],
      required: true,
      index: true,
    },
    refType: { type: String },
    refId: { type: String, index: true },
    note: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }, // append-only
);

ledgerSchema.index({ userId: 1, createdAt: -1 });

export type Wallet = InferSchemaType<typeof walletSchema>;
export type WalletLedger = InferSchemaType<typeof ledgerSchema>;

export const WalletModel = model('Wallet', walletSchema);
export const WalletLedgerModel = model('WalletLedger', ledgerSchema);
