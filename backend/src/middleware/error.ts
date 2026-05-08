import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { ErrorCode } from '../utils/errors';

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found', details: null } });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid request',
        messageHi: 'Request sahi nahi hai.',
        details: err.flatten(),
      },
    });
    return;
  }
  if (err instanceof HttpError) {
    res
      .status(err.status)
      .json({
        error: {
          code: err.code,
          message: err.message,
          messageHi: hindiMessage(err.code),
          details: err.details ?? null,
        },
      });
    return;
  }
  logger.error({ err }, 'unhandled error');
  res.status(500).json({
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Something went wrong',
      messageHi: 'Kuch galat ho gaya. Dobara try karein.',
      details: null,
    },
  });
};

function hindiMessage(code: string): string {
  switch (code) {
    case ErrorCode.OTP_EXPIRED:
      return 'OTP ki samay seema khatam ho gayi. Naya OTP request karein.';
    case ErrorCode.OTP_WRONG:
      return 'OTP galat hai. Dobara try karein.';
    case ErrorCode.OTP_LOCKED:
      return 'Bahut zyada galat attempts. Naya OTP request karein.';
    case ErrorCode.OTP_COOLDOWN:
    case ErrorCode.OTP_RATE_LIMITED:
      return 'Thoda wait karke dobara OTP request karein.';
    case ErrorCode.TOKEN_EXPIRED:
    case ErrorCode.INVALID_TOKEN:
    case ErrorCode.REFRESH_REUSE:
      return 'Session expire ho gaya. Dobara login karein.';
    case ErrorCode.USER_BLOCKED:
      return 'Ye account blocked hai.';
    case ErrorCode.INSUFFICIENT_WALLET_BALANCE:
      return 'Wallet balance low hai. Add money ya UPI se pay karein.';
    case ErrorCode.AMOUNT_OUT_OF_RANGE:
      return 'Recharge amount allowed range me nahi hai.';
    case ErrorCode.RECHARGE_NOT_FOUND:
      return 'Recharge transaction nahi mila.';
    default:
      return 'Kuch galat ho gaya. Dobara try karein.';
  }
}
