import type { NextFunction, Request, RequestHandler, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { env } from '../config/env';
import { logger } from '../utils/logger';

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

export const enforceHttps: RequestHandler = (req, res, next) => {
  if (env.NODE_ENV !== 'production') return next();
  const proto = req.header('x-forwarded-proto') ?? req.protocol;
  if (proto === 'https') return next();
  res.status(403).json({
    error: {
      code: 'HTTPS_REQUIRED',
      message: 'HTTPS is required.',
      messageHi: 'Secure HTTPS connection required hai.',
      details: null,
    },
  });
};

export const sanitizeRequest: RequestHandler = (req, _res, next) => {
  req.body = sanitizeValue(req.body);
  req.params = sanitizeValue(req.params) as Request['params'];
  req.query = sanitizeValue(req.query) as Request['query'];
  next();
};

export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    logger.info(
      {
        method: req.method,
        path: redactUrl(req.originalUrl),
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
        ip: maskIp(req.ip),
      },
      'http request',
    );
  });
  next();
};

export const loginAttemptLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'LOGIN_RATE_LIMITED',
      message: 'Too many login attempts. Please try again in 15 minutes.',
      messageHi: 'Bahut zyada login attempts. 15 minute baad try karein.',
      details: null,
    },
  },
});

export function rawBodySaver(req: Request, _res: Response, buf: Buffer) {
  (req as Request & { rawBody?: string }).rawBody = buf.toString('utf8');
}

export function sanitizeOutputString(value: unknown): string | null {
  if (value == null) return null;
  return String(value).replace(CONTROL_CHARS, '').replace(/[<>]/g, '').trim();
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, item]) => {
      if (key.startsWith('$') || key.includes('.')) return acc;
      acc[key] = sanitizeValue(item);
      return acc;
    }, {});
  }
  if (typeof value === 'string') return value.replace(CONTROL_CHARS, '').trim();
  return value;
}

function redactUrl(url: string) {
  return url
    .replace(/([?&](?:mobile|number|phone|pan|aadhaar|account|token|refreshToken)=)[^&]+/gi, '$1[REDACTED]')
    .replace(/\b[6-9]\d{9}\b/g, '[MOBILE]')
    .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, '[PAN]');
}

function maskIp(ip?: string) {
  if (!ip) return 'unknown';
  const clean = ip.replace(/^::ffff:/, '');
  const parts = clean.split('.');
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`;
  return clean.slice(0, 10) + '*';
}
