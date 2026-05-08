import { Types } from 'mongoose';

import { env } from '../../config/env';
import { NotificationModel } from './notification.model';

export const notificationService = {
  async list(userId: string, unreadOnly = false) {
    if (env.SKIP_INFRA_CONNECT) return [];
    const query: Record<string, unknown> = { userId };
    if (unreadOnly) query.readAt = null;
    const rows = await NotificationModel.find(query).sort({ createdAt: -1 }).limit(50).lean();
    return rows.map((row) => ({
      id: String(row._id),
      type: row.type,
      title: row.title,
      body: row.body,
      data: row.data ?? null,
      readAt: row.readAt ?? null,
      createdAt: row.createdAt,
    }));
  },

  async unreadCount(userId: string) {
    if (env.SKIP_INFRA_CONNECT) return 0;
    return NotificationModel.countDocuments({ userId, readAt: null });
  },

  async markRead(userId: string, id: string) {
    if (env.SKIP_INFRA_CONNECT) return;
    await NotificationModel.updateOne(
      { _id: new Types.ObjectId(id), userId },
      { $set: { readAt: new Date() } },
    );
  },

  async markAllRead(userId: string) {
    if (env.SKIP_INFRA_CONNECT) return;
    await NotificationModel.updateMany(
      { userId, readAt: null },
      { $set: { readAt: new Date() } },
    );
  },

  async create(input: {
    userId: string;
    type: 'recharge_success' | 'recharge_failed' | 'cashback_credit' | 'wallet_topup' | 'system';
    title: string;
    body: string;
    data?: unknown;
  }) {
    if (env.SKIP_INFRA_CONNECT) {
      return { _id: `notif_${Date.now()}`, ...input, createdAt: new Date() };
    }
    return NotificationModel.create(input);
  },
};
