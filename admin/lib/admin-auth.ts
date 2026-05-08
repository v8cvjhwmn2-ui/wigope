import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

const cookieName = 'wigope_admin_session';
const maxAgeSeconds = 60 * 60 * 8;

export function configuredAdminEmail() {
  return process.env.ADMIN_EMAIL ?? 'admin@wigope.com';
}

export function hasAdminPassword() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_OTP_CODE && adminSessionSecret());
}

export function validateAdminCredentials(email: string, password: string, otp: string) {
  const expectedEmail = configuredAdminEmail().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const expectedOtp = process.env.ADMIN_OTP_CODE;
  if (!expectedPassword || !expectedOtp) return false;
  return email.toLowerCase() === expectedEmail && safeEqual(password, expectedPassword) && safeEqual(otp, expectedOtp);
}

export function createAdminSession(email: string) {
  const payload = {
    email,
    role: 'super_admin',
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function readAdminSession(req: NextRequest) {
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  return verifyAdminSession(token);
}

export function verifyAdminSession(token: string) {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  if (!safeEqual(sign(body), signature)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      email: string;
      role: string;
      exp: number;
    };
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function adminCookieOptions() {
  return {
    name: cookieName,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAgeSeconds,
    path: '/',
  };
}

function sign(value: string) {
  const secret = adminSessionSecret();
  if (!secret) throw new Error('Admin session secret is not configured');
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function adminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PANEL_SECRET || '';
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
