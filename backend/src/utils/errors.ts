/**
 * Single source of truth for every error code the API emits.
 * Mobile maps these codes to localized strings — keep in sync with
 * `mobile/lib/core/error/error_mapper.dart`.
 */
import { HttpError } from '../middleware/error';

export const ErrorCode = {
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Auth — OTP
  OTP_RATE_LIMITED: 'OTP_RATE_LIMITED',
  OTP_COOLDOWN: 'OTP_COOLDOWN',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_WRONG: 'OTP_WRONG',
  OTP_LOCKED: 'OTP_LOCKED',
  SMS_PROVIDER_FAILED: 'SMS_PROVIDER_FAILED',

  // Auth — JWT
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  REFRESH_REUSE: 'REFRESH_REUSE',

  // User
  USER_BLOCKED: 'USER_BLOCKED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',

  INSUFFICIENT_WALLET_BALANCE: 'INSUFFICIENT_WALLET_BALANCE',
  RECHARGE_PROVIDER_FAILED: 'RECHARGE_PROVIDER_FAILED',
  RECHARGE_NOT_FOUND: 'RECHARGE_NOT_FOUND',
  AMOUNT_OUT_OF_RANGE: 'AMOUNT_OUT_OF_RANGE',

  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
export type ErrorCodeT = (typeof ErrorCode)[keyof typeof ErrorCode];

export const Err = {
  rateLimited: (retryAfter: number) =>
    new HttpError(429, ErrorCode.OTP_RATE_LIMITED, 'Too many OTP requests. Please try again later.', {
      retryAfter,
    }),
  cooldown: (retryAfter: number) =>
    new HttpError(429, ErrorCode.OTP_COOLDOWN, `Please wait ${retryAfter}s before requesting another OTP.`, {
      retryAfter,
    }),
  otpExpired: () =>
    new HttpError(410, ErrorCode.OTP_EXPIRED, 'OTP has expired. Please request a new one.'),
  otpWrong: (attemptsLeft: number) =>
    new HttpError(401, ErrorCode.OTP_WRONG, 'Incorrect OTP. Please try again.', { attemptsLeft }),
  otpLocked: () =>
    new HttpError(423, ErrorCode.OTP_LOCKED, 'Too many wrong attempts. Request a new OTP.'),
  smsFailed: () =>
    new HttpError(502, ErrorCode.SMS_PROVIDER_FAILED, "Couldn't send SMS. Please try again."),

  tokenExpired: () =>
    new HttpError(401, ErrorCode.TOKEN_EXPIRED, 'Access token expired'),
  invalidToken: () =>
    new HttpError(401, ErrorCode.INVALID_TOKEN, 'Invalid or malformed token'),
  refreshReuse: () =>
    new HttpError(401, ErrorCode.REFRESH_REUSE, 'Session invalidated. Please sign in again.'),

  userBlocked: (reason?: string | null) =>
    new HttpError(403, ErrorCode.USER_BLOCKED, reason ?? 'This account has been blocked.', { reason }),
  userNotFound: () =>
    new HttpError(404, ErrorCode.USER_NOT_FOUND, 'User not found'),
  forbidden: () =>
    new HttpError(403, ErrorCode.FORBIDDEN, 'You do not have permission for this action'),
  validation: (message = 'Invalid request') =>
    new HttpError(400, ErrorCode.VALIDATION_ERROR, message),
  insufficientWallet: () =>
    new HttpError(402, ErrorCode.INSUFFICIENT_WALLET_BALANCE, 'Wallet balance is low. Add money or pay with UPI.'),
  rechargeNotFound: () =>
    new HttpError(404, ErrorCode.RECHARGE_NOT_FOUND, 'Recharge transaction not found'),
  amountOutOfRange: (min: number, max: number) =>
    new HttpError(400, ErrorCode.AMOUNT_OUT_OF_RANGE, `Amount must be between ₹${min} and ₹${max}`),
  rechargeProviderFailed: (message = 'Recharge provider request failed') =>
    new HttpError(502, ErrorCode.RECHARGE_PROVIDER_FAILED, message),
};
