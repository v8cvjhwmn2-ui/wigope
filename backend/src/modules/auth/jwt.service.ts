import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { env } from '../../config/env';
import { Err } from '../../utils/errors';

export interface AccessClaims {
  sub: string;
  role: 'user' | 'admin' | 'super_admin';
  type: 'access';
}

export interface RefreshClaims {
  sub: string;
  family: string;
  fingerprint: string;
  jti: string;
  type: 'refresh';
}

const accessTtl = env.JWT_ACCESS_TTL as `${number}${'s' | 'm' | 'h' | 'd'}`;
const refreshTtl = env.JWT_REFRESH_TTL as `${number}${'s' | 'm' | 'h' | 'd'}`;

export const jwtService = {
  signAccess(claims: Omit<AccessClaims, 'type'>): string {
    return jwt.sign({ ...claims, type: 'access' }, env.JWT_ACCESS_SECRET, {
      expiresIn: accessTtl,
    });
  },

  signRefresh(claims: Omit<RefreshClaims, 'type' | 'jti'>): { token: string; jti: string } {
    const jti = uuid();
    const token = jwt.sign({ ...claims, jti, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
      expiresIn: refreshTtl,
    });
    return { token, jti };
  },

  verifyAccess(token: string): AccessClaims {
    try {
      const c = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessClaims;
      if (c.type !== 'access') throw Err.invalidToken();
      return c;
    } catch (e) {
      if ((e as { name?: string }).name === 'TokenExpiredError') throw Err.tokenExpired();
      throw Err.invalidToken();
    }
  },

  verifyRefresh(token: string): RefreshClaims {
    try {
      const c = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshClaims;
      if (c.type !== 'refresh') throw Err.invalidToken();
      return c;
    } catch (e) {
      if ((e as { name?: string }).name === 'TokenExpiredError') throw Err.tokenExpired();
      throw Err.invalidToken();
    }
  },

  /** Refresh token TTL in milliseconds — for the Session.expiresAt index. */
  refreshTtlMs(): number {
    return parseTtl(env.JWT_REFRESH_TTL);
  },
};

function parseTtl(s: string): number {
  const m = /^(\d+)([smhd])$/.exec(s);
  if (!m) throw new Error(`Bad TTL: ${s}`);
  const n = Number(m[1]);
  return n * { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2] as 's' | 'm' | 'h' | 'd'];
}
