export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: Record<string, unknown> | null
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function userMessage(error: unknown) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NETWORK':
        return error.message || "We couldn't reach Wigope servers. Check your connection and retry.";
      case 'REQUEST_TIMEOUT':
        return 'The request timed out. Please retry in a moment.';
      case 'PROXY_NETWORK_ERROR':
        return 'Wigope API gateway is temporarily unreachable. Please retry.';
      case 'OTP_COOLDOWN':
        return 'Please wait before requesting another OTP.';
      case 'OTP_RATE_LIMITED':
        return 'Too many OTP requests. Please try again later.';
      case 'OTP_WRONG':
        return 'Incorrect OTP. Please check the SMS and try again.';
      case 'OTP_EXPIRED':
        return 'OTP expired. Please request a fresh code.';
      case 'INSUFFICIENT_WALLET_BALANCE':
        return 'Wallet balance is low. Add money and try again.';
      case 'TOKEN_EXPIRED':
      case 'INVALID_TOKEN':
      case 'REFRESH_REUSE':
        return 'Session expired. Please login again.';
      default:
        return error.message || 'Wigope could not complete this request. Please retry.';
    }
  }
  return 'Wigope could not complete this request. Please retry.';
}
