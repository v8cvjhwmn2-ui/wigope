import crypto from 'node:crypto';

import { env } from '../config/env';

/** Constant-time SHA-256 of a value, hex-encoded. Used for OTP + refresh hashes. */
export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/** Cryptographically random N-digit numeric string (default 6). */
export function randomNumeric(length = 6): string {
  let out = '';
  while (out.length < length) {
    const buf = crypto.randomBytes(length);
    for (const b of buf) {
      out += (b % 10).toString();
      if (out.length === length) break;
    }
  }
  return out;
}

/** Random URL-safe token (default 32 bytes → 43 chars). Used for refresh JTI. */
export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

/** HMAC-SHA256, hex. Used to verify webhook signatures. */
export function hmac(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/** AES-256-GCM encryption for high-risk PII such as PAN/Aadhaar fields. */
export function encryptPii(value: string): string {
  const key = piiKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64url')}:${tag.toString('base64url')}:${ciphertext.toString('base64url')}`;
}

export function decryptPii(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith('v1:')) return value;
  const [, ivRaw, tagRaw, ciphertextRaw] = value.split(':');
  if (!ivRaw || !tagRaw || !ciphertextRaw) return null;
  const decipher = crypto.createDecipheriv('aes-256-gcm', piiKey(), Buffer.from(ivRaw, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextRaw, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

function piiKey(): Buffer {
  if (!env.PII_ENCRYPTION_KEY) {
    if (env.NODE_ENV === 'production') {
      throw new Error('PII_ENCRYPTION_KEY is required in production');
    }
    return crypto.createHash('sha256').update('wigope-local-dev-pii-key').digest();
  }
  const raw = env.PII_ENCRYPTION_KEY.trim();
  if (/^[a-f0-9]{64}$/i.test(raw)) return Buffer.from(raw, 'hex');
  const base64 = Buffer.from(raw, 'base64');
  if (base64.length === 32) return base64;
  return crypto.createHash('sha256').update(raw).digest();
}
