import { Router, type RequestHandler } from 'express';

import { env } from '../../config/env';
import { requireAuth, requireRole } from '../../middleware/auth';
import { KycSubmissionModel } from '../kyc/kyc.model';
import { NotificationModel } from '../notification/notification.model';
import { TransactionModel } from '../transaction/transaction.model';
import { UserModel } from '../user/user.model';
import { WalletLedgerModel, WalletModel } from '../wallet/wallet.model';

const router = Router();

const adminGuard: RequestHandler = (req, res, next) => {
  const headerSecret = req.header('x-admin-secret');
  if (env.ADMIN_PANEL_SECRET && headerSecret === env.ADMIN_PANEL_SECRET) {
    req.auth = { sub: 'admin-dashboard', role: 'admin' };
    return next();
  }
  return requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err);
    return requireRole('admin')(req, res, next);
  });
};

router.use(adminGuard);

router.get('/admin/dashboard', async (_req, res, next) => {
  try {
    if (env.SKIP_INFRA_CONNECT) {
      res.json({ ok: true, success: true, data: emptyDashboardData() });
      return;
    }

    const [users, transactions, wallets, ledger, kyc, notifications] = await Promise.all([
      UserModel.find().sort({ createdAt: -1 }).limit(200).lean(),
      TransactionModel.find().sort({ createdAt: -1 }).limit(250).lean(),
      WalletModel.find().sort({ updatedAt: -1 }).limit(200).lean(),
      WalletLedgerModel.find().sort({ createdAt: -1 }).limit(200).lean(),
      KycSubmissionModel.find().sort({ createdAt: -1 }).limit(100).lean(),
      NotificationModel.find().sort({ createdAt: -1 }).limit(100).lean(),
    ]);

    const successTxns = transactions.filter((txn) => txn.status === 'success');
    const failedTxns = transactions.filter((txn) => txn.status === 'failed');
    const totalAmount = successTxns.reduce((sum, txn) => sum + Number(txn.amount ?? 0), 0);
    const totalCashback = successTxns.reduce((sum, txn) => sum + Number(txn.cashbackAmount ?? 0), 0);
    const successRate = transactions.length ? (successTxns.length / transactions.length) * 100 : 0;

    const mappedTransactions = transactions.map((txn) => ({
      id: String(txn._id),
      user: String(txn.userId ?? ''),
      mobile: maskRecipient(String(txn.recipient ?? '')),
      service: txn.service ?? txn.type,
      operator: txn.operator ?? 'Unknown',
      amount: Number(txn.amount ?? 0),
      cashbackAmount: Number(txn.cashbackAmount ?? 0),
      status: txn.status,
      paymentMode: txn.paymentMode,
      time: toDisplayDate(txn.createdAt),
      createdAt: txn.createdAt,
      raw: txn,
    }));

    const mappedUsers = users.map((user) => ({
      id: String(user._id),
      name: user.name ?? 'Wigope user',
      mobile: maskMobile(user.mobile),
      email: user.email ?? '',
      kyc: user.kycStatus,
      wallet: Number(user.walletBalance ?? 0),
      blocked: Boolean(user.isBlocked),
      joined: toDisplayDate(user.createdAt),
      raw: user,
    }));

    const mappedKyc = kyc.map((item) => ({
      id: String(item._id),
      name: item.aadhaarName ?? 'KYC user',
      pan: maskPan(String(item.pan ?? '')),
      aadhaar: `XXXX XXXX ${item.aadhaarLast4 ?? '----'}`,
      confidence: Number(item.ocrConfidence ?? 0),
      status: item.status,
      submitted: toDisplayDate(item.createdAt),
      raw: item,
    }));

    res.json({
      ok: true,
      success: true,
      data: {
        overview: {
          kpis: {
            revenue: totalAmount,
            transactions: transactions.length,
            successRate,
            lastSettlement: 0,
            totalCashback,
            users: users.length,
            wallets: wallets.length,
          },
          revenueSeries: seriesByDay(successTxns, 'amount'),
          transactionSeries: stackedSeries(transactions),
          operatorSeries: operatorSeries(transactions),
          recentTransactions: mappedTransactions.slice(0, 20),
        },
        users: mappedUsers,
        transactions: mappedTransactions,
        rechargeStream: mappedTransactions
          .filter((txn) => ['recharge', 'mobile_prepaid', 'mobile_postpaid', 'dth', 'electricity', 'fastag'].includes(String(txn.service)))
          .slice(0, 50)
          .map((txn) => ({
            ...txn,
            latency: 'live',
            request: txn.raw?.meta?.providerRequest ?? null,
            response: txn.raw?.meta?.providerResponse ?? txn.raw?.meta ?? null,
          })),
        wallets: wallets.map((wallet) => ({
          userId: String(wallet.userId),
          balance: Number(wallet.balance ?? 0),
          lockedBalance: Number(wallet.lockedBalance ?? 0),
          lifetimeAdded: Number(wallet.lifetimeAdded ?? 0),
          lifetimeSpent: Number(wallet.lifetimeSpent ?? 0),
          updatedAt: wallet.updatedAt,
        })),
        walletLedger: ledger.map((row) => ({
          id: String(row._id),
          userId: String(row.userId),
          type: row.type,
          source: row.source,
          amount: Number(row.amount ?? 0),
          balanceAfter: Number(row.balanceAfter ?? 0),
          refId: row.refId,
          note: row.note,
          createdAt: row.createdAt,
        })),
        kycQueue: mappedKyc,
        notifications: notifications.map((item) => ({
          id: String(item._id),
          type: item.type,
          title: item.title,
          body: item.body,
          read: Boolean(item.readAt),
          createdAt: item.createdAt,
        })),
        apiLogs: [],
        webhookEvents: [],
        reports: reportCards(transactions, users, ledger),
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;

function toDisplayDate(value?: unknown) {
  const date = value instanceof Date ? value : value ? new Date(String(value)) : null;
  if (!date || Number.isNaN(date.valueOf())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function maskMobile(value?: string | null) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(-10);
  return digits.length === 10 ? `${digits.slice(0, 2)}******${digits.slice(-2)}` : '';
}

function maskRecipient(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length >= 8) return `${digits.slice(0, 2)}****${digits.slice(-4)}`;
  return value;
}

function maskPan(value: string) {
  return value.length >= 8 ? `${value.slice(0, 3)}****${value.slice(-1)}` : '***';
}

function seriesByDay(rows: Array<Record<string, unknown>>, amountKey: string) {
  const days = lastNDays(12);
  return days.map((day) => ({
    day: day.label,
    revenue: rows
      .filter((row) => sameDay(row.createdAt, day.date))
      .reduce((sum, row) => sum + Number(row[amountKey] ?? 0), 0),
  }));
}

function stackedSeries(rows: Array<Record<string, unknown>>) {
  const days = lastNDays(7);
  return days.map((day) => {
    const dayRows = rows.filter((row) => sameDay(row.createdAt, day.date));
    return {
      name: day.label,
      recharge: dayRows.filter((row) => String(row.type) === 'recharge').length,
      bills: dayRows.filter((row) => String(row.service ?? '').includes('electricity') || String(row.service ?? '').includes('fastag')).length,
      rewards: dayRows.filter((row) => String(row.service ?? '').includes('google_play')).length,
    };
  });
}

function operatorSeries(rows: Array<Record<string, unknown>>) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = String(row.operator ?? 'Unknown');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));
}

function reportCards(rows: Array<Record<string, unknown>>, users: Array<Record<string, unknown>>, ledger: Array<Record<string, unknown>>) {
  return [
    { title: 'Daily revenue', rows: rows.length, amount: sumAmount(rows, 'amount') },
    { title: 'GST report', rows: rows.filter((row) => row.status === 'success').length, amount: sumAmount(rows, 'commissionAmount') },
    { title: 'Operator-wise volume', rows: operatorSeries(rows).length, amount: rows.length },
    { title: 'User growth', rows: users.length, amount: users.length },
    { title: 'Wallet ledger', rows: ledger.length, amount: sumAmount(ledger, 'amount') },
  ];
}

function sumAmount(rows: Array<Record<string, unknown>>, key: string) {
  return rows.reduce((sum, row) => sum + Number(row[key] ?? 0), 0);
}

function lastNDays(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (count - index - 1));
    return { date, label: `${date.getDate()}/${date.getMonth() + 1}` };
  });
}

function sameDay(value: unknown, date: Date) {
  const compare = value instanceof Date ? value : value ? new Date(String(value)) : null;
  return (
    compare != null &&
    !Number.isNaN(compare.valueOf()) &&
    compare.getFullYear() === date.getFullYear() &&
    compare.getMonth() === date.getMonth() &&
    compare.getDate() === date.getDate()
  );
}

function emptyDashboardData() {
  return {
    overview: {
      kpis: {
        revenue: 0,
        transactions: 0,
        successRate: 0,
        lastSettlement: 0,
        totalCashback: 0,
        users: 0,
        wallets: 0,
      },
      revenueSeries: [],
      transactionSeries: [],
      operatorSeries: [],
      recentTransactions: [],
    },
    users: [],
    transactions: [],
    rechargeStream: [],
    wallets: [],
    walletLedger: [],
    kycQueue: [],
    notifications: [],
    apiLogs: [],
    webhookEvents: [],
    reports: [],
  };
}
