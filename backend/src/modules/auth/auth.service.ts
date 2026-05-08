import { Types } from 'mongoose';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { Err } from '../../utils/errors';
import { sanitizeUser, UserModel, type UserDoc } from '../user/user.model';
import { otpService } from './otp.service';
import { jwtService } from './jwt.service';
import { SessionModel } from './session.model';

interface DeviceInfo {
  platform?: string | null;
  model?: string | null;
  osVersion?: string | null;
  appVersion?: string | null;
  fcmToken?: string | null;
}

interface RequestCtx {
  ip: string;
  userAgent?: string;
}

type MemoryUser = {
  id: string;
  mobile: string;
  name: string | null;
  email: string | null;
  kycStatus: 'none';
  walletBalance: number;
  referralCode: string;
  role: 'user';
  isBlocked: boolean;
  blockedReason: string | null;
};

const memoryUsers = new Map<string, MemoryUser>();

function normalizeMobile(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 13 && input.startsWith('+91')) return `+${digits.slice(0, 12)}`;
  throw Err.invalidToken(); // shouldn't reach — controller validates first
}

function fingerprint(d: DeviceInfo): string {
  const seed = `${d.platform ?? ''}|${d.model ?? ''}|${d.osVersion ?? ''}|${d.appVersion ?? ''}`;
  return crypto.createHash('sha256').update(seed).digest('hex').slice(0, 32);
}

export const authService = {
  async sendOtp(input: { mobile: string } & RequestCtx) {
    const mobile = normalizeMobile(input.mobile);
    return otpService.send({ mobile, ip: input.ip, userAgent: input.userAgent });
  },

  async verifyOtp(
    input: { mobile: string; otp: string; deviceInfo?: DeviceInfo } & RequestCtx,
  ) {
    const mobile = normalizeMobile(input.mobile);
    await otpService.verify({
      mobile,
      otp: input.otp,
      ip: input.ip,
      userAgent: input.userAgent,
    });

    if (env.SKIP_INFRA_CONNECT) {
      const user = memoryUser(mobile);
      if (user.isBlocked) throw Err.userBlocked(user.blockedReason);
      const tokens = issueMemoryTokens(user, fingerprint(input.deviceInfo ?? {}));
      return { user: sanitizeMemoryUser(user), ...tokens, isNewUser: false };
    }

    let user = await UserModel.findOne({ mobile });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = await UserModel.create({
        mobile,
        deviceInfo: input.deviceInfo ?? {},
        lastLoginAt: new Date(),
        ...(input.deviceInfo?.fcmToken ? { fcmToken: input.deviceInfo.fcmToken } : {}),
      });
    } else {
      if (user.isBlocked) throw Err.userBlocked(user.blockedReason);
      user.lastLoginAt = new Date();
      if (input.deviceInfo) user.deviceInfo = { ...user.deviceInfo, ...input.deviceInfo };
      if (input.deviceInfo?.fcmToken) user.fcmToken = input.deviceInfo.fcmToken;
      await user.save();
    }

    const tokens = await issueTokens(user, fingerprint(input.deviceInfo ?? {}), input);
    return { user: sanitizeUser(user as UserDoc), ...tokens, isNewUser };
  },

  async refresh(input: { refreshToken: string } & RequestCtx) {
    const claims = jwtService.verifyRefresh(input.refreshToken);

    if (env.SKIP_INFRA_CONNECT) {
      const user = [...memoryUsers.values()].find((u) => u.id === claims.sub);
      if (!user) throw Err.userNotFound();
      return issueMemoryTokens(user, claims.fingerprint, claims.family);
    }

    const session = await SessionModel.findOne({ jti: claims.jti });

    // Reuse detection — three signals all imply theft of the refresh token.
    if (!session || session.revokedAt) {
      await SessionModel.updateMany(
        { family: claims.family, revokedAt: null },
        { $set: { revokedAt: new Date(), revokedReason: 'reuse' } },
      );
      logger.warn({ family: claims.family, sub: claims.sub }, 'refresh reuse detected');
      throw Err.refreshReuse();
    }

    const tokenMatches = await bcrypt.compare(input.refreshToken, session.refreshTokenHash);
    if (!tokenMatches) {
      await SessionModel.updateMany(
        { family: claims.family, revokedAt: null },
        { $set: { revokedAt: new Date(), revokedReason: 'reuse' } },
      );
      logger.warn({ family: claims.family, sub: claims.sub }, 'refresh token hash mismatch');
      throw Err.refreshReuse();
    }

    const user = await UserModel.findById(claims.sub);
    if (!user) throw Err.userNotFound();
    if (user.isBlocked) {
      session.revokedAt = new Date();
      session.revokedReason = 'user_blocked';
      await session.save();
      throw Err.userBlocked(user.blockedReason);
    }

    // Rotate
    session.revokedAt = new Date();
    session.revokedReason = 'rotated';
    await session.save();

    const newSession = await issueTokens(
      user as UserDoc,
      claims.fingerprint,
      input,
      claims.family,
    );
    session.replacedBy = (newSession as unknown as { _sessionId: Types.ObjectId })._sessionId;
    await session.save();

    return newSession;
  },

  async logout(input: { refreshToken: string }) {
    if (env.SKIP_INFRA_CONNECT) return;
    try {
      const claims = jwtService.verifyRefresh(input.refreshToken);
      await SessionModel.updateOne(
        { jti: claims.jti, revokedAt: null },
        { $set: { revokedAt: new Date(), revokedReason: 'logout' } },
      );
    } catch {
      // logout is best-effort — never leak auth errors
    }
  },

  async me(userId: string) {
    if (env.SKIP_INFRA_CONNECT) {
      const user = [...memoryUsers.values()].find((u) => u.id === userId);
      if (!user) throw Err.userNotFound();
      return sanitizeMemoryUser(user);
    }
    const user = await UserModel.findById(userId);
    if (!user) throw Err.userNotFound();
    return sanitizeUser(user as UserDoc);
  },
};

// ─── helpers ────────────────────────────────────────────────────────────────

async function issueTokens(
  user: UserDoc,
  fingerprintHash: string,
  ctx: RequestCtx,
  reuseFamily?: string,
) {
  const family = reuseFamily ?? crypto.randomUUID();
  const accessToken = jwtService.signAccess({
    sub: String(user._id),
    role: user.role as 'user' | 'admin' | 'super_admin',
  });
  const { token: refreshToken, jti } = jwtService.signRefresh({
    sub: String(user._id),
    family,
    fingerprint: fingerprintHash,
  });

  const session = await SessionModel.create({
    userId: user._id,
    family,
    jti,
    refreshTokenHash: await bcrypt.hash(refreshToken, 10),
    deviceFingerprint: fingerprintHash,
    userAgent: ctx.userAgent,
    ip: ctx.ip,
    expiresAt: new Date(Date.now() + jwtService.refreshTtlMs()),
  });

  return {
    accessToken,
    refreshToken,
    _sessionId: session._id,
  } as { accessToken: string; refreshToken: string; _sessionId: Types.ObjectId };
}

function memoryUser(mobile: string): MemoryUser {
  const existing = memoryUsers.get(mobile);
  if (existing) return existing;
  const id = crypto.createHash('sha256').update(mobile).digest('hex').slice(0, 24);
  const user: MemoryUser = {
    id,
    mobile,
    name: 'Keshav',
    email: null,
    kycStatus: 'none',
    walletBalance: 0,
    referralCode: `WIGO${id.slice(-6).toUpperCase()}`,
    role: 'user',
    isBlocked: false,
    blockedReason: null,
  };
  memoryUsers.set(mobile, user);
  return user;
}

function issueMemoryTokens(user: MemoryUser, fingerprintHash: string, reuseFamily?: string) {
  const family = reuseFamily ?? crypto.randomUUID();
  const accessToken = jwtService.signAccess({ sub: user.id, role: user.role });
  const { token: refreshToken } = jwtService.signRefresh({
    sub: user.id,
    family,
    fingerprint: fingerprintHash,
  });
  return { accessToken, refreshToken, _sessionId: new Types.ObjectId() };
}

function sanitizeMemoryUser(user: MemoryUser) {
  return {
    id: user.id,
    mobile: user.mobile,
    name: user.name,
    email: user.email,
    kycStatus: user.kycStatus,
    walletBalance: user.walletBalance,
    referralCode: user.referralCode,
    role: user.role,
    createdAt: null,
  };
}
