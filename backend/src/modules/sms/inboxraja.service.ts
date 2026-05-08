import axios, { AxiosInstance } from 'axios';

import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { Err } from '../../utils/errors';
import { HttpError } from '../../middleware/error';
import { runtimeConfig } from '../admin/runtime-config.service';

export interface SmsProvider {
  /** Send a verification OTP to a 10-digit Indian mobile (no country code). */
  sendOtp(input: { mobile: string; otp: string }): Promise<{ providerMessageId?: string }>;
}

/**
 * InboxRaja DLT integration.
 *
 * Endpoint: GET {BASE}/bulkV2 with query params (per their docs).
 * Auth: `authorization` query param holding the API key.
 *
 * The DLT template MUST contain a single `{#var#}` token. We send the OTP as
 * `variables_values`. Template-id is the *numeric* message id, not the body
 * text — fetch it from InboxRaja → DLT Manager → Templates.
 */
class InboxRajaProvider implements SmsProvider {
  private readonly timeout = 10_000;

  async sendOtp(input: { mobile: string; otp: string }) {
    const cleanMobile = input.mobile.replace(/^\+?91/, '').replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      throw new Error(`Invalid mobile for SMS: ${maskMobile(cleanMobile)}`);
    }

    const params = {
      authorization: runtimeConfig.get('INBOXRAJA_API_KEY'),
      sender_id: runtimeConfig.get('INBOXRAJA_SENDER_ID'),
      message: runtimeConfig.get('INBOXRAJA_TEMPLATE_ID'),
      variables_values: input.otp,
      route: 'dlt',
      numbers: cleanMobile,
      flash: '0',
      sms_details: '1',
    };

    const bases = fallbackBases(runtimeConfig.get('INBOXRAJA_BASE_URL') || env.INBOXRAJA_BASE_URL);
    let lastErr: unknown;
    for (const baseURL of bases) {
      try {
        const http = axios.create({ baseURL, timeout: this.timeout });
        const res = await http.get('/bulkV2', { params });
        return this._parse(res.data, cleanMobile);
      } catch (err) {
        if (err instanceof HttpError) throw err;
        lastErr = err;
        logger.warn(
          { err: smsErrorSummary(err), providerBase: maskProviderBase(baseURL) },
          'sms provider attempt failed',
        );
        if (!shouldTryFallback(err)) break;
      }
    }

    logger.error(
      { err: smsErrorSummary(lastErr), providerBases: bases.map(maskProviderBase) },
      'all sms provider attempts failed',
    );
    throw Err.smsFailed();
  }

  private _parse(data: unknown, mobile: string) {
    // InboxRaja returns 200 even on logical failures. The exact response shape
    // varies — see docs/INBOXRAJA.md (filled in after first real send).
    const body = (data ?? {}) as Record<string, unknown>;
    const failed =
      body.return === false || body.status === 'error' || body.error || body.success === false;
    if (failed) {
      logger.error({ body, mobile: maskMobile(mobile) }, 'inboxraja send rejected');
      throw Err.smsFailed();
    }
    const id =
      (body.message_id as string | undefined) ??
      (body.messageId as string | undefined) ??
      (body.id as string | undefined);
    logger.info({ mobile: maskMobile(mobile), id }, 'OTP sms dispatched');
    return { providerMessageId: id };
  }
}

class MockProvider implements SmsProvider {
  async sendOtp({ mobile, otp }: { mobile: string; otp: string }) {
    logger.warn(
      { mobile: maskMobile(mobile), otpLength: otp.length },
      `[MOCK SMS] OTP generated for ${maskMobile(mobile)}`,
    );
    return { providerMessageId: `mock_${Date.now()}` };
  }
}

function maskMobile(m: string): string {
  return m.length === 10 ? `${m.slice(0, 2)}******${m.slice(-2)}` : '***';
}

function fallbackBases(primary: string): string[] {
  return [primary];
}

function shouldTryFallback(e: unknown): boolean {
  const err = e as { code?: string; response?: { status?: number } };
  return (
    err.code === 'ENOTFOUND' ||
    err.code === 'EAI_AGAIN' ||
    err.code === 'ECONNABORTED' ||
    err.code === 'ECONNRESET' ||
    (err.response?.status ?? 0) >= 500
  );
}

function smsErrorSummary(e: unknown) {
  const err = e as {
    code?: string;
    message?: string;
    response?: { status?: number; data?: unknown };
  };
  return {
    code: err?.code,
    message: err?.message,
    status: err?.response?.status,
    response: err?.response?.data,
  };
}

function maskProviderBase(baseURL: string): string {
  try {
    return new URL(baseURL).origin;
  } catch {
    return 'invalid-url';
  }
}

export const sms: SmsProvider =
  new (class DynamicSmsProvider implements SmsProvider {
    private readonly inbox = new InboxRajaProvider();
    private readonly mock = new MockProvider();

    async sendOtp(input: { mobile: string; otp: string }) {
      const provider = runtimeConfig.get('SMS_PROVIDER') || env.SMS_PROVIDER;
      const apiKey = runtimeConfig.get('INBOXRAJA_API_KEY');
      if (provider === 'inboxraja' && apiKey) {
        return this.inbox.sendOtp(input);
      }
      if (env.NODE_ENV === 'production') {
        throw Err.smsFailed();
      }
      return this.mock.sendOtp(input);
    }
  })();
