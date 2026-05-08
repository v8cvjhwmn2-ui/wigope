import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
      : undefined,
  redact: {
    // Never log PII. Add fields here if you find any leaking.
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.authorization',
      'authorization',
      'cookie',
      'req.body.mobile',
      'req.body.pan',
      'req.body.aadhaar',
      'req.body.aadhaarLast4',
      'req.body.account',
      'req.body.otp',
      'req.body.refreshToken',
      'req.query.mobile',
      'req.query.number',
      'req.query.pan',
      'req.query.aadhaar',
      'req.params.mobile',
      'req.params.number',
      '*.INBOXRAJA_API_KEY',
      '*.KWIKAPI_API_KEY',
      '*.RAZORPAY_KEY_SECRET',
      '*.JWT_ACCESS_SECRET',
      '*.JWT_REFRESH_SECRET',
      'err.config.params.authorization',
      'err.config.params.api_key',
      'err.config.data.api_key',
      'err.config.headers.Authorization',
      'err.request._currentUrl',
      'err.request._options.path',
      'err.request._options.search',
      'err.request._currentRequest._header',
      '*.mobile',
      '*.pan',
      '*.aadhaar',
      '*.account',
      '*.otp',
    ],
    censor: '[REDACTED]',
  },
});
