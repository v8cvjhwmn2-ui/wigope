import { api } from '@/lib/api-client';
import type { NotificationItem } from '@/types/api';

export const notificationService = {
  list() {
    return api<{ notifications: NotificationItem[]; unreadCount: number }>('/notifications');
  },
  markAllRead() {
    return api('/notifications/read-all', { method: 'POST' });
  }
};
