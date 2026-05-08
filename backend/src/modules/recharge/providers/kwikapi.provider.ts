import axios, { AxiosError, type AxiosInstance } from 'axios';
import crypto from 'crypto';

import { env } from '../../../config/env';
import { runtimeConfig } from '../../admin/runtime-config.service';
import { logger } from '../../../utils/logger';
import {
  type BillFetchResult,
  type BillPaymentResult,
  type Circle,
  type DthPlan,
  type MobilePlan,
  type Offer,
  type Operator,
  type OperatorDetail,
  type ProviderStatus,
  type ProviderTransaction,
  type RechargeProvider,
  RechargeProviderError,
  type RechargeResult,
  type ServiceCategory,
  type TransactionStatus,
  type WebhookEvent,
} from './recharge-provider.interface';

type JsonMap = Record<string, unknown>;

export class KwikApiProvider implements RechargeProvider {
  readonly name = 'kwikapi' as const;
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.KWIKAPI_BASE_URL,
      timeout: 30_000,
    });
  }

  async fetchServiceCategories(): Promise<ServiceCategory[]> {
    return [
      { serviceName: 'Prepaid', totalOperators: 0, iconKey: 'prepaid_recharges', displayOrder: 1, isActive: true },
      { serviceName: 'DTH', totalOperators: 0, iconKey: 'dth_d2h_recharges', displayOrder: 2, isActive: true },
      { serviceName: 'Postpaid', totalOperators: 0, iconKey: 'postpaid_payments', displayOrder: 3, isActive: true },
      { serviceName: 'FASTag', totalOperators: 0, iconKey: 'fastag_recharges', displayOrder: 4, isActive: true },
      { serviceName: 'eChallan', totalOperators: 0, iconKey: 'echallan', displayOrder: 5, isActive: true },
      { serviceName: 'EV Recharge', totalOperators: 0, iconKey: 'ev_recharge', displayOrder: 6, isActive: true },
      { serviceName: 'Electricity', totalOperators: 0, iconKey: 'electricity_payments', displayOrder: 7, isActive: true },
      { serviceName: 'Prepaid Meter', totalOperators: 0, iconKey: 'prepaid_meter', displayOrder: 8, isActive: true },
      { serviceName: 'Gas', totalOperators: 0, iconKey: 'gas_payments', displayOrder: 9, isActive: true },
      { serviceName: 'Water', totalOperators: 0, iconKey: 'water_payments', displayOrder: 10, isActive: true },
      { serviceName: 'Insurance', totalOperators: 0, iconKey: 'insurance_payments', displayOrder: 11, isActive: true },
      { serviceName: 'Broadband/Landline', totalOperators: 0, iconKey: 'broadband_landline', displayOrder: 12, isActive: true },
      { serviceName: 'GAS Cylinder Booking', totalOperators: 0, iconKey: 'gas_cylinder_booking', displayOrder: 13, isActive: true },
      { serviceName: 'Cable TV', totalOperators: 0, iconKey: 'cable_tv_payments', displayOrder: 14, isActive: true },
      { serviceName: 'Credit Card', totalOperators: 0, iconKey: 'credit_card_payment', displayOrder: 15, isActive: true },
    ];
  }

  async fetchOperators(serviceFilter?: string): Promise<Operator[]> {
    try {
      const data = await this.get('/api/v2/operator_list.php', { service: serviceFilter });
      const rows = pickArray(data, ['data', 'operators', 'details', 'records']);
      return rows.map((row, i) => mapOperator(asMap(row), serviceFilter, i));
    } catch (error) {
      this.logProviderError('operator list failed', error);
      throw new RechargeProviderError('NETWORK', 'Operator list fetch failed', toErrorPayload(error));
    }
  }

  async fetchOperatorDetails(opid: string | string[]): Promise<OperatorDetail[]> {
    const ids = Array.isArray(opid) ? opid : [opid];
    const operators = await this.fetchOperators();
    return operators.filter((op) => ids.includes(op.opid));
  }

  async fetchCircles(): Promise<Circle[]> {
    try {
      const data = await this.get('/api/v2/circle_list.php');
      const rows = pickArray(data, ['data', 'circles', 'details', 'records']);
      const mapped = rows.map((row) => {
        const r = asMap(row);
        return {
          circleCode: String(r.circle_code ?? r.code ?? r.id ?? ''),
          circleName: String(r.circle_name ?? r.name ?? ''),
        };
      }).filter((row) => row.circleCode && row.circleName);
      return mapped;
    } catch (error) {
      this.logProviderError('circle list failed', error);
      throw new RechargeProviderError('NETWORK', 'Circle list fetch failed', toErrorPayload(error));
    }
  }

  async detectOperator(mobile: string) {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    try {
      const data = await this.post('/api/v2/operator_fetch_v2.php', { number: cleanMobile });
      const details = asMap(data.details ?? data.data ?? data);
      return {
        opid: String(details.opid ?? details.operator_id ?? details.operatorCode ?? '1'),
        operatorName: String(details.provider ?? details.operatorName ?? details.operator ?? 'Jio'),
        circleCode: String(details.circle_code ?? details.circleCode ?? '5'),
        circleName: String(details.circle_name ?? details.circleName ?? 'Delhi NCR'),
      };
    } catch (error) {
      this.logProviderError('operator detect failed', error);
      throw new RechargeProviderError('NETWORK', 'Operator detection failed', toErrorPayload(error));
    }
  }

  async fetchMobilePlans(opid: string, circleCode: string): Promise<MobilePlan[]> {
    try {
      const data = await this.get('/api/v2/plans.php', { opid, circle_code: circleCode });
      const rows = pickArray(data, ['data', 'plans', 'details', 'records']);
      return rows.map((row, i) => mapPlan(asMap(row), i));
    } catch (error) {
      this.logProviderError('mobile plans failed', error);
      throw new RechargeProviderError('NETWORK', 'Mobile plans fetch failed', toErrorPayload(error));
    }
  }

  async fetchDthPlans(opid: string): Promise<DthPlan[]> {
    try {
      const data = await this.get('/api/v2/dth_plans.php', { opid });
      const rows = pickArray(data, ['data', 'plans', 'details', 'records']);
      return rows.map((row, i) => mapPlan(asMap(row), i));
    } catch (error) {
      this.logProviderError('dth plans failed', error);
      throw new RechargeProviderError('NETWORK', 'DTH plans fetch failed', toErrorPayload(error));
    }
  }

  async fetchROffers(opid: string, mobile: string): Promise<Offer[]> {
    try {
      const data = await this.get('/api/v2/r_offer.php', { opid, number: mobile.replace(/\D/g, '').slice(-10) });
      const rows = pickArray(data, ['data', 'offers', 'details', 'records']);
      return rows.map((row, i) => {
        const r = asMap(row);
        return {
          id: String(r.id ?? `offer_${i}`),
          amount: toNumber(r.amount ?? r.rs ?? r.price, 0),
          description: String(r.description ?? r.desc ?? r.detail ?? 'Recommended offer'),
        };
      }).filter((row) => row.amount > 0);
    } catch (error) {
      this.logProviderError('r-offers failed', error);
      return [];
    }
  }

  async fetchBill(input: { opid: string; number: string; opt1to10?: Record<string, string>; mobile: string; orderId: string }): Promise<BillFetchResult> {
    try {
      const data = await this.post('/api/v2/bill_fetch.php', {
        opid: input.opid,
        number: input.number,
        mobile: input.mobile,
        order_id: input.orderId,
        ...(input.opt1to10 ?? {}),
      });
      return {
        status: mapStatus(data.status ?? data.success),
        dueAmount: toNumber(data.amount ?? data.dueAmount ?? data.bill_amount, undefined),
        customerName: stringOrUndefined(data.customerName ?? data.customer_name ?? data.name),
        dueDate: stringOrUndefined(data.dueDate ?? data.due_date),
        billRefId: stringOrUndefined(data.ref_id ?? data.reference_id ?? data.billRefId),
        message: stringOrUndefined(data.message),
        raw: data,
      };
    } catch (error) {
      this.logProviderError('bill fetch failed', error);
      throw new RechargeProviderError('NETWORK', 'Bill fetch failed', toErrorPayload(error));
    }
  }

  async doRecharge(input: { opid: string; number: string; amount: number; orderId: string }): Promise<RechargeResult> {
    try {
      const data = await this.get('/api/v2/recharge.php', {
        number: input.number,
        amount: input.amount,
        opid: input.opid,
        order_id: input.orderId,
      });
      return mapRechargeResult(data);
    } catch (error) {
      this.logProviderError('recharge submit failed', error);
      throw new RechargeProviderError('NETWORK', 'Recharge submit failed', toErrorPayload(error));
    }
  }

  async doBillPayment(input: {
    opid: string;
    number: string;
    amount: number;
    orderId: string;
    refrenceId?: string;
    opt1to10?: Record<string, string>;
    mobile: string;
  }): Promise<BillPaymentResult> {
    try {
      const data = await this.post('/api/v2/bill_payment.php', {
        opid: input.opid,
        number: input.number,
        amount: input.amount,
        order_id: input.orderId,
        reference_id: input.refrenceId,
        mobile: input.mobile,
        ...(input.opt1to10 ?? {}),
      });
      return mapRechargeResult(data);
    } catch (error) {
      this.logProviderError('bill payment failed', error);
      throw new RechargeProviderError('NETWORK', 'Bill payment failed', toErrorPayload(error));
    }
  }

  async getTransactionStatus(orderId: string): Promise<TransactionStatus> {
    try {
      const data = await this.get('/api/v2/status.php', { order_id: orderId });
      return mapRechargeResult(data);
    } catch (error) {
      this.logProviderError('status poll failed', error);
      throw new RechargeProviderError('NETWORK', 'Status poll failed', toErrorPayload(error));
    }
  }

  async getRecentTransactions(): Promise<ProviderTransaction[]> {
    try {
      const data = await this.get('/api/v2/recent_transactions.php');
      const rows = pickArray(data, ['data', 'transactions', 'records', 'details']);
      return rows.map((row) => {
        const r = asMap(row);
        return {
          orderId: String(r.order_id ?? r.orderId ?? ''),
          status: mapStatus(r.status),
          amount: toNumber(r.amount, undefined),
          providerTxnId: stringOrUndefined(r.opr_id ?? r.providerTxnId),
        };
      }).filter((row) => row.orderId);
    } catch (error) {
      this.logProviderError('recent transactions failed', error);
      return [];
    }
  }

  async getProviderBalance(): Promise<{ balance: number; currency: 'INR' }> {
    try {
      const data = await this.get('/api/v2/balance.php');
      return { balance: toNumber(data.balance ?? data.amount, 0), currency: 'INR' };
    } catch (error) {
      this.logProviderError('provider balance failed', error);
      return { balance: 0, currency: 'INR' };
    }
  }

  verifyWebhookSignature(rawBody: string, signature?: string): boolean {
    const secret = runtimeConfig.get('KWIKAPI_WEBHOOK_SECRET') || env.KWIKAPI_WEBHOOK_SECRET;
    if (!secret) return true;
    if (!signature) return false;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return safeEqual(signature, expected);
  }

  parseWebhookEvent(rawBody: string): WebhookEvent {
    const data = JSON.parse(rawBody) as JsonMap;
    return {
      orderId: String(data.order_id ?? data.orderId ?? ''),
      status: mapStatus(data.status ?? data.txn_status),
      providerTxnId: stringOrUndefined(data.opr_id ?? data.providerTxnId),
      message: stringOrUndefined(data.message),
      raw: data,
    };
  }

  private async get(path: string, params: JsonMap = {}): Promise<JsonMap> {
    const res = await this.client.get(path, {
      baseURL: runtimeConfig.get('KWIKAPI_BASE_URL') || env.KWIKAPI_BASE_URL,
      params: { api_key: runtimeConfig.get('KWIKAPI_API_KEY') || env.KWIKAPI_API_KEY, ...params },
    });
    return asMap(res.data);
  }

  private async post(path: string, data: JsonMap = {}): Promise<JsonMap> {
    const res = await this.client.post(
      path,
      { api_key: runtimeConfig.get('KWIKAPI_API_KEY') || env.KWIKAPI_API_KEY, ...data },
      { baseURL: runtimeConfig.get('KWIKAPI_BASE_URL') || env.KWIKAPI_BASE_URL },
    );
    return asMap(res.data);
  }

  private logProviderError(message: string, error: unknown) {
    const payload = toErrorPayload(error);
    logger.warn({ provider: this.name, error: payload }, message);
  }
}

function mapRechargeResult(data: JsonMap): RechargeResult {
  return {
    status: mapStatus(data.status ?? data.txn_status ?? data.success),
    providerTxnId: stringOrUndefined(data.opr_id ?? data.operator_ref ?? data.txn_id ?? data.id),
    message: stringOrUndefined(data.message ?? data.msg ?? data.error),
    raw: data,
  };
}

function mapStatus(value: unknown): ProviderStatus {
  const s = String(value ?? '').toUpperCase();
  if (value === true || ['SUCCESS', 'SUCCESSFUL', 'COMPLETED', '1', 'TRUE'].includes(s)) return 'SUCCESS';
  if (value === false || ['FAILED', 'FAILURE', 'REJECTED', 'REFUNDED', '0', 'FALSE'].includes(s)) return 'FAILURE';
  return 'PENDING';
}

function mapOperator(row: JsonMap, serviceFilter: string | undefined, index: number): Operator {
  return {
    opid: String(row.opid ?? row.operator_id ?? row.id ?? index + 1),
    operatorName: String(row.operatorName ?? row.operator_name ?? row.name ?? row.provider ?? 'Operator'),
    serviceType: String(row.serviceType ?? row.service_type ?? row.service ?? serviceFilter ?? 'Prepaid'),
    status: String(row.status ?? 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
    billFetchSupported: Boolean(row.billFetchSupported ?? row.bill_fetch_supported ?? row.biller_status === 'on'),
    bbpsEnabled: Boolean(row.bbpsEnabled ?? row.bbps_enabled ?? row.bbps),
    amountMinimum: toNumber(row.min_amount ?? row.amountMinimum, 10),
    amountMaximum: toNumber(row.max_amount ?? row.amountMaximum, 10000),
  };
}

function mapPlan(row: JsonMap, index: number): MobilePlan {
  return {
    id: String(row.id ?? row.plan_id ?? `plan_${index}`),
    amount: toNumber(row.amount ?? row.rs ?? row.price, 0),
    validity: stringOrUndefined(row.validity ?? row.days),
    description: String(row.description ?? row.desc ?? row.detail ?? row.plan_name ?? 'Recharge plan'),
    category: String(row.category ?? row.type ?? 'Popular'),
  };
}

function pickArray(data: JsonMap, keys: string[]): unknown[] {
  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value)) return value;
  }
  return Array.isArray(data) ? data : [];
}

function asMap(value: unknown): JsonMap {
  return value && typeof value === 'object' ? (value as JsonMap) : {};
}

function toNumber(value: unknown, fallback: number): number;
function toNumber(value: unknown, fallback: undefined): number | undefined;
function toNumber(value: unknown, fallback: number | undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function stringOrUndefined(value: unknown) {
  const s = String(value ?? '');
  return s ? s : undefined;
}

function toErrorPayload(error: unknown) {
  if (error instanceof AxiosError) {
    return {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    };
  }
  if (error instanceof Error) return { message: error.message };
  return error;
}

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
