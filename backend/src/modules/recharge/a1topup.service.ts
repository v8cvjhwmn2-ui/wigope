import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

/**
 * Single facade over A1Topup. All upstream recharge calls flow through here so a future
 * provider swap (BBPS aggregator, Eko, Plansbox) is one file. See ADR-0006.
 */
export interface RechargeProvider {
  detectOperator(mobile: string): Promise<{ operator: string; circle: string } | null>;
  fetchPlans(operator: string, circle: string, type?: string): Promise<unknown[]>;
  recharge(input: RechargeInput): Promise<RechargeResult>;
  status(providerTxnId: string): Promise<RechargeStatus>;
}

export interface RechargeInput {
  service: 'mobile_prepaid' | 'mobile_postpaid' | 'dth' | 'electricity' | 'fastag';
  number: string;
  operator: string;
  circle?: string;
  amount: number;
  /** Our internal txn id — A1Topup echoes this back as their reference. */
  clientRef: string;
}

export type RechargeStatus = 'pending' | 'success' | 'failed';

export interface RechargeResult {
  providerTxnId: string;
  status: RechargeStatus;
  raw: unknown;
}

class A1TopupClient implements RechargeProvider {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.A1TOPUP_BASE_URL,
      timeout: 20_000,
      headers: env.A1TOPUP_API_KEY ? { Authorization: `Bearer ${env.A1TOPUP_API_KEY}` } : {},
    });

    this.http.interceptors.response.use(
      (r) => r,
      (err) => {
        logger.warn({ url: err.config?.url, status: err.response?.status }, 'a1topup error');
        throw err;
      },
    );
  }

  async detectOperator(mobile: string) {
    if (!env.A1TOPUP_API_KEY) return null;
    const { data } = await this.http.get('/operator-detect', { params: { number: mobile } });
    return { operator: String(data.operator), circle: String(data.circle) };
  }

  async fetchPlans(operator: string, circle: string, type = 'popular') {
    if (!env.A1TOPUP_API_KEY) return [];
    const { data } = await this.http.get('/plans', { params: { operator, circle, type } });
    return Array.isArray(data?.plans) ? data.plans : [];
  }

  async recharge(input: RechargeInput): Promise<RechargeResult> {
    if (!env.A1TOPUP_API_KEY) {
      // Mock for local dev — every recharge "succeeds" instantly.
      return { providerTxnId: `mock_${input.clientRef}`, status: 'success', raw: { mocked: true } };
    }
    const { data } = await this.http.post('/recharge', {
      service: input.service,
      number: input.number,
      operator: input.operator,
      circle: input.circle,
      amount: input.amount,
      reference: input.clientRef,
    });
    return {
      providerTxnId: String(data.txnId),
      status: mapStatus(data.status),
      raw: data,
    };
  }

  async status(providerTxnId: string) {
    if (!env.A1TOPUP_API_KEY) return 'success' as const;
    const { data } = await this.http.get(`/status/${providerTxnId}`);
    return mapStatus(data.status);
  }
}

function mapStatus(s: string): RechargeStatus {
  if (['SUCCESS', 'COMPLETE', 'COMPLETED', 'success'].includes(s)) return 'success';
  if (['FAILED', 'FAIL', 'REJECTED', 'failed'].includes(s)) return 'failed';
  return 'pending';
}

export const a1topup: RechargeProvider = new A1TopupClient();
