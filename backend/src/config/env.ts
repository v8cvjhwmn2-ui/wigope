import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  APP_BASE_URL: z.string().url().default('https://recharge-api.wigope.com'),
  CORS_ORIGINS: z.string().optional(),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  ADMIN_PANEL_SECRET: z.string().default(''),

  MONGO_URI: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  REDIS_URL: z.string().default(''),
  UPSTASH_REDIS_REST_URL: z.string().default(''),
  UPSTASH_REDIS_REST_TOKEN: z.string().default(''),
  SKIP_INFRA_CONNECT: z.coerce.boolean().default(false),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),
  OTP_LENGTH: z.coerce.number().default(6),
  OTP_EXPIRY_SECONDS: z.coerce.number().optional(),
  OTP_TTL_SECONDS: z.coerce.number().optional(),
  OTP_SEND_RATE_LIMIT_PER_HOUR_MOBILE: z.coerce.number().optional(),
  OTP_RATE_PER_MOBILE_PER_HOUR: z.coerce.number().optional(),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(3),

  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().default(30),
  OTP_SEND_RATE_LIMIT_PER_HOUR_IP: z.coerce.number().default(10),

  SMS_PROVIDER: z.enum(['inboxraja', 'msg91', 'twilio']).default('inboxraja'),
  INBOXRAJA_URL: z.string().optional(),
  INBOXRAJA_API_KEY: z.string().default(''),
  INBOXRAJA_SENDER_ID: z.string().default('WIGOPE'),
  INBOXRAJA_MESSAGE_ID: z.string().optional(),
  INBOXRAJA_TEMPLATE_ID: z.string().default(''),
  INBOXRAJA_BASE_URL: z.string().default('https://web.inboxraja.in/dev'),

  A1TOPUP_BASE_URL: z.string().url().default('https://api.a1topup.com'),
  A1TOPUP_API_KEY: z.string().default(''),
  A1TOPUP_WEBHOOK_SECRET: z.string().default(''),

  RAZORPAY_KEY_ID: z.string().default(''),
  RAZORPAY_KEY_SECRET: z.string().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().default(''),

  WIGOPE_UPI_BASE_URL: z.string().default(''),
  WIGOPE_UPI_MERCHANT_ID: z.string().default(''),
  WIGOPE_UPI_API_KEY: z.string().default(''),
  WIGOPE_UPI_WEBHOOK_SECRET: z.string().default(''),

  HUBBLE_X_SECRET: z.string().default(''),
  HUBBLE_SSO_TTL_SECONDS: z.coerce.number().default(900),
  HUBBLE_WEBHOOK_SECRET: z.string().default(''),

  KWIKAPI_BASE_URL: z.string().url().default('https://uat.kwikapi.com'),
  KWIKAPI_API_KEY: z.string().default(''),
  KWIKAPI_WEBHOOK_SECRET: z.string().default(''),
  KWIKAPI_ENVIRONMENT: z.enum(['uat', 'production']).default('uat'),
  RECHARGE_MIN_AMOUNT: z.coerce.number().default(10),
  RECHARGE_MAX_AMOUNT: z.coerce.number().default(10000),
  RECHARGE_DAILY_LIMIT: z.coerce.number().default(20000),
  RECONCILE_INTERVAL_MINUTES: z.coerce.number().default(5),
  RECONCILE_MAX_AGE_MINUTES: z.coerce.number().default(30),

  PII_ENCRYPTION_KEY: z.string().default(''),
  LOG_LEVEL: z.string().default('info'),
  SENTRY_DSN: z.string().default(''),
  POSTHOG_KEY: z.string().default(''),
  POSTHOG_HOST: z.string().url().default('https://app.posthog.com'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

const mongoUri = raw.MONGO_URI ?? raw.MONGODB_URI;
if (!mongoUri && !raw.SKIP_INFRA_CONNECT) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', {
    MONGO_URI: ['Required unless SKIP_INFRA_CONNECT=true'],
  });
  process.exit(1);
}

const redisConfigured =
  Boolean(raw.UPSTASH_REDIS_REST_URL && raw.UPSTASH_REDIS_REST_TOKEN) || Boolean(raw.REDIS_URL);
if (!redisConfigured && !raw.SKIP_INFRA_CONNECT) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', {
    UPSTASH_REDIS_REST_URL: ['Required with token unless REDIS_URL or SKIP_INFRA_CONNECT=true'],
  });
  process.exit(1);
}

export const env = {
  ...raw,
  MONGO_URI: mongoUri ?? '',
  MONGODB_URI: mongoUri ?? '',
  CORS_ORIGINS: raw.CORS_ORIGINS ?? raw.CORS_ALLOWED_ORIGINS ?? '',
  OTP_TTL_SECONDS: raw.OTP_TTL_SECONDS ?? raw.OTP_EXPIRY_SECONDS ?? 300,
  OTP_EXPIRY_SECONDS: raw.OTP_EXPIRY_SECONDS ?? raw.OTP_TTL_SECONDS ?? 300,
  OTP_RATE_PER_MOBILE_PER_HOUR:
    raw.OTP_RATE_PER_MOBILE_PER_HOUR ?? raw.OTP_SEND_RATE_LIMIT_PER_HOUR_MOBILE ?? 3,
  OTP_SEND_RATE_LIMIT_PER_HOUR_MOBILE:
    raw.OTP_SEND_RATE_LIMIT_PER_HOUR_MOBILE ?? raw.OTP_RATE_PER_MOBILE_PER_HOUR ?? 3,
  INBOXRAJA_TEMPLATE_ID: raw.INBOXRAJA_TEMPLATE_ID || raw.INBOXRAJA_MESSAGE_ID || '',
  INBOXRAJA_BASE_URL: normalizeInboxRajaBase(raw.INBOXRAJA_URL ?? raw.INBOXRAJA_BASE_URL),
};

export const corsOrigins = env.CORS_ORIGINS
  ? env.CORS_ORIGINS.split(',').map((s) => s.trim())
  : [];

function normalizeInboxRajaBase(url: string): string {
  return url.replace(/\/bulkV2\/?$/i, '').replace(/\/$/, '');
}
