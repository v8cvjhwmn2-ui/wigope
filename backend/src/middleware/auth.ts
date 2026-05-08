import type { RequestHandler } from 'express';
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
    return next(Err.invalidToken());
  }
  const token = header.slice(7);
  try {
    const decoded = jwtService.verifyAccess(token);
    req.auth = decoded;
    next();
  } catch (e) {
    next(e);
  }
};

export const requireRole = (role: AuthClaims['role']): RequestHandler => (req, _res, next) => {
  if (req.auth?.role !== role) {
    return next(Err.forbidden());
  }
  next();
};
