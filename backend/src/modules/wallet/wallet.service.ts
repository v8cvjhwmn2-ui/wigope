import Razorpay from 'razorpay';

import { env } from '../../config/env';
import { runtimeConfig } from '../admin/runtime-config.service';
import { Err } from '../../utils/errors';
import { TransactionModel } from '../transaction/transaction.model';
import { sanitizeUser, UserModel } from '../user/user.model';
import { WalletLedgerModel, WalletModel } from './wallet.model';

export const walletService = {
  async profile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw Err.userNotFound();
    const wallet = await ensureWallet(userId);
    return {
      user: sanitizeUser(user),
      wallet: serializeWallet(wallet),
    };
  },

  async balance(userId: string) {
    const wallet = await ensureWallet(userId);
    return serializeWallet(wallet);
  },

  async ledger(userId: string, limit = 20) {
    if (env.SKIP_INFRA_CONNECT) return [];
    const rows = await WalletLedgerModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Math.min(Math.max(limit, 1), 50))
      .lean();
    return rows.map((row) => ({
      id: String(row._id),
      type: row.type,
      amount: row.amount,
      balanceBefore: row.balanceBefore,
      balanceAfter: row.balanceAfter,
      source: row.source,
      refType: row.refType ?? null,
      refId: row.refId ?? null,
      note: row.note ?? null,
      createdAt: row.createdAt,
    }));
  },

  async createAddMoneyOrder(userId: string, amount: number) {
    if (!Number.isFinite(amount) || amount < 10 || amount > 100000) {
      throw Err.validation('Amount must be between ₹10 and ₹1,00,000');
    }
    const paise = Math.round(amount * 100);
    const receipt = `wg_topup_${Date.now()}_${String(userId).slice(-6)}`;
    const razorpay = buildRazorpay();
    if (env.SKIP_INFRA_CONNECT) {
      if (!razorpay) throw Err.validation('Razorpay keys are not configured in admin settings');
      return {
        orderId: `order_uat_${Date.now()}`,
        amount,
        amountPaise: paise,
        currency: 'INR',
        keyId: runtimeConfig.get('RAZORPAY_KEY_ID') || env.RAZORPAY_KEY_ID,
        provider: 'razorpay',
        receipt,
      };
    }

    if (!razorpay) throw Err.validation('Razorpay keys are not configured in admin settings');
    const order = await razorpay.orders.create({
      amount: paise,
      currency: 'INR',
      receipt,
      notes: { userId, purpose: 'wallet_topup' },
    });

    await TransactionModel.create({
      userId,
      type: 'deposit',
      service: 'wallet_topup',
      amount,
      paymentMode: 'upi',
      gatewayOrderId: order.id,
      status: 'initiated',
      meta: { provider: 'razorpay' },
    });

    return {
      orderId: order.id,
      amount,
      amountPaise: paise,
      currency: 'INR',
      keyId: runtimeConfig.get('RAZORPAY_KEY_ID') || env.RAZORPAY_KEY_ID,
      provider: 'razorpay',
      receipt,
    };
  },

  async debit(input: {
    userId: string;
    amount: number;
    source: 'recharge' | 'hubble_rewards' | 'admin_adjust';
    refType?: string;
    refId?: string;
    note?: string;
  }) {
    const amount = normalizeAmount(input.amount);
    if (env.SKIP_INFRA_CONNECT) {
      return {
        _id: `ledger_debit_${Date.now()}`,
        userId: input.userId,
        type: 'debit',
        amount,
      };
    }
    const wallet = await ensureWallet(input.userId);
    if (wallet.balance < amount) {
      throw Err.insufficientWallet();
    }

    const balanceBefore = wallet.balance;
    wallet.balance = roundMoney(wallet.balance - amount);
    wallet.lifetimeSpent = roundMoney((wallet.lifetimeSpent ?? 0) + amount);
    await wallet.save();

    return WalletLedgerModel.create({
      userId: input.userId,
      type: 'debit',
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      source: input.source,
      refType: input.refType,
      refId: input.refId,
      note: input.note,
    });
  },

  async credit(input: {
    userId: string;
    amount: number;
    source: 'add_money' | 'refund' | 'cashback' | 'commission' | 'admin_adjust' | 'hubble_rewards';
    refType?: string;
    refId?: string;
    note?: string;
  }) {
    const amount = normalizeAmount(input.amount);
    if (env.SKIP_INFRA_CONNECT) {
      return {
        _id: `ledger_credit_${Date.now()}`,
        userId: input.userId,
        type: 'credit',
        amount,
      };
    }
    const wallet = await ensureWallet(input.userId);
    const balanceBefore = wallet.balance;
    wallet.balance = roundMoney(wallet.balance + amount);
    if (input.source === 'add_money' || input.source === 'cashback' || input.source === 'commission') {
      wallet.lifetimeAdded = roundMoney((wallet.lifetimeAdded ?? 0) + amount);
    }
    await wallet.save();

    return WalletLedgerModel.create({
      userId: input.userId,
      type: 'credit',
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      source: input.source,
      refType: input.refType,
      refId: input.refId,
      note: input.note,
    });
  },
};

async function ensureWallet(userId: string) {
  return WalletModel.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, balance: 0, lockedBalance: 0 } },
    { upsert: true, new: true },
  );
}

function serializeWallet(wallet: Awaited<ReturnType<typeof ensureWallet>>) {
  return {
    balance: wallet.balance,
    lockedBalance: wallet.lockedBalance,
    lifetimeAdded: wallet.lifetimeAdded,
    lifetimeSpent: wallet.lifetimeSpent,
    updatedAt: wallet.updatedAt,
  };
}

function normalizeAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) throw Err.validation('Amount must be positive');
  return roundMoney(amount);
}

function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}

function buildRazorpay() {
  const keyId = runtimeConfig.get('RAZORPAY_KEY_ID') || env.RAZORPAY_KEY_ID;
  const keySecret = runtimeConfig.get('RAZORPAY_KEY_SECRET') || env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}
