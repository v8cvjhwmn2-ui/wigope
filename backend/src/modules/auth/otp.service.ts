import bcrypt from 'bcryptjs';

import { env } from '../../config/env';
import { redis } from '../../config/redis';
import { logger } from '../../utils/logger';
import { Err } from '../../utils/errors';
import { randomNumeric } from '../../utils/crypto';
import { sms } from '../sms/inboxraja.service';
import { OtpAttemptModel } from './otp-attempt.model';

interface OtpStored {
  hash: string;
  attempts: number;
  createdAt: number;
}

const KEY = {
  otp: (mobile: string) => `otp:${mobile}`,
  cooldown: (mobile: string) => `otp:cooldown:${mobile}`,
  rateMobile: (mobile: string) => `otp:rate:mobile:${mobile}`,
  rateIp: (ip: string) => `otp:rate:ip:${ip}`,
};

const HOUR = 3_600;

export const otpService = {
  async send(input: { mobile: string; ip: string; userAgent?: string }) {
    const { mobile, ip, userAgent } = input;

    // 1. Resend cooldown — second-by-second
    const cooldownTtl = await getTtl(KEY.cooldown(mobile));
    if (cooldownTtl > 0) throw Err.cooldown(cooldownTtl);

    // 2. Mobile rate limit
    const mobileCount = await redis.incrWithExpiry(KEY.rateMobile(mobile), HOUR);
    if (mobileCount > env.OTP_RATE_PER_MOBILE_PER_HOUR) {
      await audit(mobile, ip, userAgent, 'rate_limited');
      throw Err.rateLimited(HOUR);
    }

    // 3. IP rate limit
    const ipCount = await redis.incrWithExpiry(KEY.rateIp(ip), HOUR);
    if (ipCount > env.OTP_SEND_RATE_LIMIT_PER_HOUR_IP) {
      await audit(mobile, ip, userAgent, 'rate_limited');
      throw Err.rateLimited(HOUR);
    }

    // 4. Generate + persist
    const otp = randomNumeric(env.OTP_LENGTH);
    const hash = await bcrypt.hash(otp, 8);
    const stored: OtpStored = { hash, attempts: 0, createdAt: Date.now() };
    await redis.setEx(KEY.otp(mobile), JSON.stringify(stored), env.OTP_TTL_SECONDS);
    await redis.setEx(KEY.cooldown(mobile), '1', env.OTP_RESEND_COOLDOWN_SECONDS);

    // 5. Dispatch
    let providerMessageId: string | undefined;
    try {
      const r = await sms.sendOtp({ mobile, otp });
      providerMessageId = r.providerMessageId;
    } catch (e) {
      // SMS failure: roll back so user isn't billed a request attempt/cooldown
      // for an OTP that did not actually go out.
      await redis.del(KEY.otp(mobile));
      await redis.del(KEY.cooldown(mobile));
      logger.error({ err: smsErrorSummary(e), mobile: mask(mobile) }, 'sms dispatch failed');
      throw e;
    }

    await audit(mobile, ip, userAgent, 'sent', providerMessageId);

    return {
      sentTo: maskedDisplay(mobile),
      expiresInSeconds: env.OTP_TTL_SECONDS,
      retryAfterSeconds: env.OTP_RESEND_COOLDOWN_SECONDS,
    };
  },

  async verify(input: { mobile: string; otp: string; ip: string; userAgent?: string }) {
    const { mobile, otp, ip, userAgent } = input;

    const raw = await redis.get(KEY.otp(mobile));
    if (!raw) {
      await audit(mobile, ip, userAgent, 'expired');
      throw Err.otpExpired();
    }

    const stored: OtpStored = JSON.parse(raw);
    if (stored.attempts >= env.OTP_MAX_ATTEMPTS) {
      await redis.del(KEY.otp(mobile));
      await audit(mobile, ip, userAgent, 'locked');
      throw Err.otpLocked();
    }

    const ok = await bcrypt.compare(otp, stored.hash);
    if (!ok) {
      stored.attempts += 1;
      const remaining = env.OTP_MAX_ATTEMPTS - stored.attempts;
      const remainingTtl = await getTtl(KEY.otp(mobile));
      const ttl = remainingTtl > 0 ? remainingTtl : env.OTP_TTL_SECONDS;
      await redis.setEx(KEY.otp(mobile), JSON.stringify(stored), ttl);
      await audit(mobile, ip, userAgent, 'failed');
      if (remaining <= 0) {
        await redis.del(KEY.otp(mobile));
        throw Err.otpLocked();
      }
      throw Err.otpWrong(remaining);
    }

    await redis.del(KEY.otp(mobile));
    await audit(mobile, ip, userAgent, 'verified');
  },
};

// ─── helpers ────────────────────────────────────────────────────────────────

async function getTtl(key: string): Promise<number> {
  // We don't have a unified ttl() in our redis facade; emulate by checking
  // whether the key exists, returning OTP_RESEND_COOLDOWN as worst case.
  // Both Upstash and IORedis support TTL natively — accept the simplification
  // here for now; tightened in Phase 10 if telemetry warrants.
  const v = await redis.get(key);
  return v ? env.OTP_RESEND_COOLDOWN_SECONDS : 0;
}

async function audit(
  mobile: string,
  ip: string,
  userAgent: string | undefined,
  event: 'sent' | 'verified' | 'failed' | 'expired' | 'locked' | 'rate_limited',
  providerMessageId?: string,
) {
  // Best-effort — never let an audit write break the auth path.
  OtpAttemptModel.create({ mobile, ip, userAgent, event, providerMessageId }).catch((e) =>
    logger.warn({ err: e }, 'otp audit write failed'),
  );
}

function mask(m: string) {
  return m.length === 10 ? `${m.slice(0, 2)}******${m.slice(-2)}` : '***';
}
function maskedDisplay(m: string) {
  return m.length === 10 ? `+91 ${m.slice(0, 2)}****${m.slice(-4)}` : '+91 *********';
}

function smsErrorSummary(e: unknown) {
  const err = e as {
    code?: string;
    message?: string;
    response?: { status?: number; data?: unknown };
  };
  return {
    code: err.code,
    message: err.message,
    status: err.response?.status,
    response: err.response?.data,
  };
}
