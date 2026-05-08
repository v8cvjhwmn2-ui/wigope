export type ProviderName = 'kwikapi' | 'a1topup' | 'mobikwik';
export type ProviderStatus = 'SUCCESS' | 'FAILURE' | 'PENDING';

export interface ServiceCategory {
  serviceName: string;
  totalOperators: number;
  iconKey: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Operator {
  opid: string;
  operatorName: string;
  serviceType: string;
  status: 'active' | 'inactive';
  billFetchSupported?: boolean;
  bbpsEnabled?: boolean;
  amountMinimum?: number;
  amountMaximum?: number;
  requiredParams?: Array<{ name: string; label: string; regex?: string }>;
}

export interface OperatorDetail extends Operator {
  logoUrl?: string;
}

export interface Circle {
  circleCode: string;
  circleName: string;
}

export interface MobilePlan {
  id: string;
  amount: number;
  validity?: string;
  description: string;
  category: string;
}

export interface DthPlan extends MobilePlan {}

export interface Offer {
  id: string;
  amount: number;
  description: string;
}

export interface BillFetchResult {
  status: ProviderStatus;
  dueAmount?: number;
  customerName?: string;
  dueDate?: string;
  billRefId?: string;
  message?: string;
  raw?: unknown;
}

export interface RechargeResult {
  status: ProviderStatus;
  providerTxnId?: string;
  message?: string;
  raw?: unknown;
}

export interface BillPaymentResult extends RechargeResult {}

export interface TransactionStatus extends RechargeResult {}

export interface ProviderTransaction {
  orderId: string;
  status: ProviderStatus;
  amount?: number;
  providerTxnId?: string;
}

export interface WebhookEvent {
  orderId: string;
  status: ProviderStatus;
  providerTxnId?: string;
  message?: string;
  raw: unknown;
}

export interface RechargeProvider {
  readonly name: ProviderName;

  fetchServiceCategories(): Promise<ServiceCategory[]>;
  fetchOperators(serviceFilter?: string): Promise<Operator[]>;
  fetchOperatorDetails(opid: string | string[]): Promise<OperatorDetail[]>;
  fetchCircles(): Promise<Circle[]>;

  detectOperator(mobile: string): Promise<{
    opid: string;
    operatorName: string;
    circleCode: string;
    circleName: string;
  }>;

  fetchMobilePlans(opid: string, circleCode: string): Promise<MobilePlan[]>;
  fetchDthPlans(opid: string): Promise<DthPlan[]>;
  fetchROffers(opid: string, mobile: string): Promise<Offer[]>;

  fetchBill(input: {
    opid: string;
    number: string;
    opt1to10?: Record<string, string>;
    mobile: string;
    orderId: string;
  }): Promise<BillFetchResult>;

  doRecharge(input: {
    opid: string;
    number: string;
    amount: number;
    orderId: string;
  }): Promise<RechargeResult>;

  doBillPayment(input: {
    opid: string;
    number: string;
    amount: number;
    orderId: string;
    refrenceId?: string;
    opt1to10?: Record<string, string>;
    mobile: string;
  }): Promise<BillPaymentResult>;

  getTransactionStatus(orderId: string): Promise<TransactionStatus>;
  getRecentTransactions(): Promise<ProviderTransaction[]>;
  getProviderBalance(): Promise<{ balance: number; currency: 'INR' }>;

  verifyWebhookSignature(rawBody: string, signature?: string): boolean;
  parseWebhookEvent(rawBody: string): WebhookEvent;
}

export class RechargeProviderError extends Error {
  constructor(
    public code:
      | 'INSUFFICIENT_PROVIDER_BALANCE'
      | 'IP_NOT_WHITELISTED'
      | 'INVALID_OPERATOR'
      | 'RATE_LIMITED'
      | 'NETWORK'
      | 'UNKNOWN',
    message: string,
    public raw?: unknown,
  ) {
    super(message);
  }
}
