import jwt from 'jsonwebtoken';

import { env } from '../../config/env';
import { runtimeConfig } from '../admin/runtime-config.service';
import { Err } from '../../utils/errors';
import { UserModel } from '../user/user.model';
import { WalletLedgerModel, WalletModel } from '../wallet/wallet.model';

type HubbleClaims = {
  sub: string;
  type: 'hubble_sso';
};

export const hubbleService = {
  issueSsoToken(userId: string) {
    return jwt.sign({ sub: userId, type: 'hubble_sso' }, env.JWT_ACCESS_SECRET, {
      expiresIn: Number(runtimeConfig.get('HUBBLE_SSO_TTL_SECONDS') || env.HUBBLE_SSO_TTL_SECONDS),
    });
  },

  async sso(token: string) {
    try {
      const claims = jwt.verify(token, env.JWT_ACCESS_SECRET) as HubbleClaims;
      if (claims.type !== 'hubble_sso') return { userId: null };
      const user = await UserModel.findById(claims.sub);
      if (!user || user.isBlocked) return { userId: null };
      const digits = user.mobile.replace(/^\+?91/, '').replace(/\D/g, '');
      const [firstName, ...rest] = (user.name ?? 'Wigope User').split(' ');
      return {
        userId: String(user._id),
        email: user.email ?? undefined,
        firstName,
        lastName: rest.join(' ') || undefined,
        phoneNumber: digits.length === 10 ? digits : undefined,
        cohorts: [user.role, user.kycStatus].filter(Boolean),
      };
    } catch {
      return { userId: null };
    }
  },

  async balance(userId: string) {
    const wallet = await ensureWallet(userId);
    return { userId, totalCoins: wallet.balance };
  },

  async debit(input: { userId: string; coins: number; referenceId: string; note?: string }) {
    const existing = await WalletLedgerModel.findOne({
      userId: input.userId,
      refId: input.referenceId,
      type: 'debit',
      source: 'hubble_rewards',
    });
    if (existing) {
      return {
        status: 'SUCCESS',
        transactionId: String(existing._id),
        balance: existing.balanceAfter,
        referenceId: input.referenceId,
      };
    }

    const wallet = await ensureWallet(input.userId);
    if (wallet.balance < input.coins) throw Err.validation('Insufficient balance');

    const before = wallet.balance;
    wallet.balance = before - input.coins;
    wallet.lifetimeSpent += input.coins;
    await wallet.save();

    const row = await WalletLedgerModel.create({
      userId: input.userId,
      type: 'debit',
      amount: input.coins,
      balanceBefore: before,
      balanceAfter: wallet.balance,
      source: 'hubble_rewards',
      refType: 'hubble_reference',
      refId: input.referenceId,
      note: input.note ?? 'Gift card purchase',
    });

    return {
      status: 'SUCCESS',
      transactionId: String(row._id),
      balance: wallet.balance,
      referenceId: input.referenceId,
    };
  },

  async reverse(input: {
    userId: string;
    amount: number;
    referenceId: string;
    transactionId?: string;
  }) {
    const existingReverse = await WalletLedgerModel.findOne({
      userId: input.userId,
      refId: `${input.referenceId}:reverse`,
      type: 'credit',
      source: 'hubble_rewards',
    });
    if (existingReverse) {
      return {
        status: 'ALREADY_REVERSED',
        balance: existingReverse.balanceAfter,
        reversalTransactionId: String(existingReverse._id),
      };
    }

    const original = await WalletLedgerModel.findOne({
      userId: input.userId,
      refId: input.referenceId,
      type: 'debit',
      source: 'hubble_rewards',
    });
    if (!original) throw Err.userNotFound();

    const wallet = await ensureWallet(input.userId);
    const before = wallet.balance;
    wallet.balance = before + input.amount;
    wallet.lifetimeAdded += input.amount;
    await wallet.save();

    const row = await WalletLedgerModel.create({
      userId: input.userId,
      type: 'credit',
      amount: input.amount,
      balanceBefore: before,
      balanceAfter: wallet.balance,
      source: 'hubble_rewards',
      refType: 'hubble_reversal',
      refId: `${input.referenceId}:reverse`,
      note: 'Gift card coin reversal',
    });

    return {
      status: 'SUCCESS',
      balance: wallet.balance,
      reversalTransactionId: String(row._id),
    };
  },
};

async function ensureWallet(userId: string) {
  return WalletModel.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, balance: 0, lockedBalance: 0 } },
    { upsert: true, new: true },
  );
}
