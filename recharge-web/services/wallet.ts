import { api } from '@/lib/api-client';
import type { AddMoneyOrder, WalletLedgerItem, WalletSummary } from '@/types/api';

export const walletService = {
  summary() {
    return api<{ wallet: WalletSummary }>('/wallet');
  },
  ledger() {
    return api<{ ledger: WalletLedgerItem[] }>('/wallet/ledger');
  },
  createOrder(amount: number) {
    return api<{ order: AddMoneyOrder }>('/wallet/add-money/order', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  }
};
