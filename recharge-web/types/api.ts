export type ApiEnvelope<T> = {
  ok?: boolean;
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    messageHi?: string;
    details?: Record<string, unknown> | null;
  };
};

export type AuthUser = {
  id: string;
  mobile: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  walletBalance?: number;
  referralCode?: string;
};

export type SendOtpResponse = {
  sentTo: string;
  expiresInSeconds: number;
  retryAfterSeconds: number;
};

export type VerifyOtpResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  isNewUser?: boolean;
};

export type WalletSummary = {
  balance: number;
  lockedBalance?: number;
  lifetimeAdded?: number;
  lifetimeSpent?: number;
  updatedAt?: string;
};

export type WalletLedgerItem = {
  id?: string;
  type: 'credit' | 'debit';
  amount: number;
  source?: string;
  description?: string;
  balanceAfter?: number;
  createdAt?: string;
};

export type AppTransaction = {
  id?: string;
  orderId?: string;
  type?: string;
  service?: string;
  operator?: string;
  operatorName?: string;
  recipient?: string;
  number?: string;
  amount: number;
  status: string;
  failureReason?: string;
  createdAt?: string;
  initiatedAt?: string;
};

export type NotificationItem = {
  id?: string;
  title: string;
  body?: string;
  type?: string;
  readAt?: string | null;
  createdAt?: string;
};

export type OperatorDetection = {
  opid: string;
  operatorName: string;
  circleCode: string;
  circleName: string;
};

export type MobilePlan = {
  id: string;
  amount: number;
  description: string;
  category?: string;
  validity?: string;
};

export type AddMoneyOrder = {
  id?: string;
  amount: number;
  amountPaise?: number;
  currency?: string;
  keyId?: string;
  orderId?: string;
  provider?: string;
  receipt?: string;
};
