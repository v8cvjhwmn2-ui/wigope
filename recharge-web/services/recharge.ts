import { api } from '@/lib/api-client';
import type { AppTransaction, MobilePlan, OperatorDetection } from '@/types/api';

export const rechargeService = {
  detectOperator(number: string) {
    return api<OperatorDetection>(`/recharge/detect-operator?number=${encodeURIComponent(number)}`);
  },
  mobilePlans(opid: string, circle: string) {
    return api<{ plans: MobilePlan[] }>(
      `/recharge/mobile-plans?opid=${encodeURIComponent(opid)}&circle=${encodeURIComponent(circle)}`
    );
  },
  mobileRecharge(number: string, amount: number) {
    return api<{ transaction: AppTransaction }>('/recharge/mobile', {
      method: 'POST',
      body: JSON.stringify({ number, amount, paymentMode: 'wallet' })
    });
  },
  billPayment(input: { service: string; opid: string; number: string; amount: number; mobile?: string }) {
    return api<{ transaction: AppTransaction }>('/recharge/bill-payment', {
      method: 'POST',
      body: JSON.stringify({ ...input, mobile: input.mobile ?? input.number, paymentMode: 'wallet' })
    });
  }
};
