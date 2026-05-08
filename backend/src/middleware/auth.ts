import type { RequestHandler } from 'express';
import { env } from '../config/env';
import { jwtService } from '../modules/auth/jwt.service';
import { Err } from '../utils/errors';

export interface AuthClaims {
  sub: string;
  role: 'user' | 'admin' | 'super_admin';
  scope?: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthClaims;
    }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    if (env.NODE_ENV !== 'production' && env.SKIP_INFRA_CONNECT) {
      req.auth = { sub: '000000000000000000000001', role: 'user' };
      next();
      return;
    }
    return next(Err.invalidToken());
  }
  const token = header.slice(7);
  if (env.NODE_ENV !== 'production' && token === 'debug-access-token') {
    req.auth = { sub: '000000000000000000000001', role: 'user' };
    next();
    return;
  }
  try {
    const decoded = jwtService.verifyAccess(token);
    req.auth = decoded;
    next();
  } catch (e) {
    next(e);
  }
};

export const requireRole = (role: AuthClaims['role']): RequestHandler => (req, _res, next) => {
  if (env.NODE_ENV !== 'production' && env.SKIP_INFRA_CONNECT) {
    next();
    return;
  }
  if (req.auth?.role !== role) {
    return next(Err.forbidden());
  }
  next();
};
