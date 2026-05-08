import { api } from '@/lib/api-client';
import type { AppTransaction } from '@/types/api';

export const transactionService = {
  list(status?: string) {
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return api<{ transactions: AppTransaction[] }>(`/transactions${query}`);
  },
  detail(id: string) {
    return api<{ transaction: AppTransaction }>(`/transactions/${encodeURIComponent(id)}`);
  }
};
