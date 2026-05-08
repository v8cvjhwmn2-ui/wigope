import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { env } from '../../config/env';
import { decryptPii, encryptPii } from '../../utils/crypto';
import { Err } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { RuntimeConfigModel } from './runtime-config.model';

export type RuntimeConfigKey =
  | 'SMS_PROVIDER'
  | 'INBOXRAJA_API_KEY'
  | 'INBOXRAJA_SENDER_ID'
  | 'INBOXRAJA_TEMPLATE_ID'
  | 'INBOXRAJA_BASE_URL'
  | 'RAZORPAY_KEY_ID'
  | 'RAZORPAY_KEY_SECRET'
  | 'RAZORPAY_WEBHOOK_SECRET'
  | 'KWIKAPI_BASE_URL'
  | 'KWIKAPI_API_KEY'
  | 'KWIKAPI_WEBHOOK_SECRET'
  | 'KWIKAPI_ENVIRONMENT'
  | 'HUBBLE_X_SECRET'
  | 'HUBBLE_WEBHOOK_SECRET'
  | 'HUBBLE_SSO_TTL_SECONDS';

type RuntimeConfigRecord = Record<RuntimeConfigKey, string>;

const SECRET_KEYS = new Set<RuntimeConfigKey>([
  'INBOXRAJA_API_KEY',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'KWIKAPI_API_KEY',
  'KWIKAPI_WEBHOOK_SECRET',
  'HUBBLE_X_SECRET',
  'HUBBLE_WEBHOOK_SECRET',
]);

const ALLOWED_KEYS = new Set<RuntimeConfigKey>([
  'SMS_PROVIDER',
  'INBOXRAJA_API_KEY',
  'INBOXRAJA_SENDER_ID',
  'INBOXRAJA_TEMPLATE_ID',
  'INBOXRAJA_BASE_URL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'KWIKAPI_BASE_URL',
  'KWIKAPI_API_KEY',
  'KWIKAPI_WEBHOOK_SECRET',
  'KWIKAPI_ENVIRONMENT',
  'HUBBLE_X_SECRET',
  'HUBBLE_WEBHOOK_SECRET',
  'HUBBLE_SSO_TTL_SECONDS',
]);

const cache: RuntimeConfigRecord = {
  SMS_PROVIDER: env.SMS_PROVIDER,
  INBOXRAJA_API_KEY: env.INBOXRAJA_API_KEY,
  INBOXRAJA_SENDER_ID: env.INBOXRAJA_SENDER_ID,
  INBOXRAJA_TEMPLATE_ID: env.INBOXRAJA_TEMPLATE_ID,
  INBOXRAJA_BASE_URL: env.INBOXRAJA_BASE_URL,
  RAZORPAY_KEY_ID: env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: env.RAZORPAY_WEBHOOK_SECRET,
  KWIKAPI_BASE_URL: env.KWIKAPI_BASE_URL,
  KWIKAPI_API_KEY: env.KWIKAPI_API_KEY,
  KWIKAPI_WEBHOOK_SECRET: env.KWIKAPI_WEBHOOK_SECRET,
  KWIKAPI_ENVIRONMENT: env.KWIKAPI_ENVIRONMENT,
  HUBBLE_X_SECRET: env.HUBBLE_X_SECRET,
  HUBBLE_WEBHOOK_SECRET: env.HUBBLE_WEBHOOK_SECRET,
  HUBBLE_SSO_TTL_SECONDS: String(env.HUBBLE_SSO_TTL_SECONDS),
};

const localConfigPath = path.resolve(process.cwd(), '.runtime-config.local.json');

export const runtimeConfig = {
  async hydrate() {
    if (env.SKIP_INFRA_CONNECT) {
      await hydrateLocalFile();
      return;
    }
    const rows = await RuntimeConfigModel.find().lean();
    for (const row of rows) {
      const key = row.key as RuntimeConfigKey;
      if (!ALLOWED_KEYS.has(key)) continue;
      cache[key] = decryptPii(row.valueEncrypted) ?? '';
    }
    logger.info({ count: rows.length }, 'runtime config hydrated');
  },

  get(key: RuntimeConfigKey) {
    return cache[key] ?? '';
  },

  snapshot() {
    return [...ALLOWED_KEYS].map((key) => {
      const value = cache[key] ?? '';
      return {
        key,
        value: SECRET_KEYS.has(key) ? maskSecret(value) : value,
        isSecret: SECRET_KEYS.has(key),
        configured: value.trim().length > 0,
      };
    });
  },

  async update(values: Record<string, unknown>, updatedBy: string) {
    const changed: string[] = [];
    for (const [rawKey, rawValue] of Object.entries(values)) {
      const key = rawKey as RuntimeConfigKey;
      if (!ALLOWED_KEYS.has(key)) throw Err.validation(`Unsupported config key: ${rawKey}`);
      if (rawValue == null) continue;
      const value = String(rawValue).trim();
      cache[key] = normalizeValue(key, value);
      changed.push(key);

      if (env.SKIP_INFRA_CONNECT) {
        await persistLocalFile();
      } else {
        await RuntimeConfigModel.findOneAndUpdate(
          { key },
          {
            $set: {
              valueEncrypted: encryptPii(cache[key]),
              isSecret: SECRET_KEYS.has(key),
              updatedBy,
            },
          },
          { upsert: true, new: true },
        );
      }
    }
    logger.info({ changed, updatedBy }, 'runtime config updated');
    return this.snapshot();
  },

  status() {
    return {
      mode: env.SKIP_INFRA_CONNECT ? 'local-file' : 'database',
      smsLive: cache.SMS_PROVIDER === 'inboxraja' && Boolean(cache.INBOXRAJA_API_KEY),
      rechargeLive: Boolean(cache.KWIKAPI_BASE_URL && cache.KWIKAPI_API_KEY),
      walletLive: Boolean(cache.RAZORPAY_KEY_ID && cache.RAZORPAY_KEY_SECRET),
      hubbleLive: Boolean(cache.HUBBLE_X_SECRET),
      configuredAtRuntime: true,
    };
  },
};

function normalizeValue(key: RuntimeConfigKey, value: string) {
  if (key === 'INBOXRAJA_BASE_URL') return value.replace(/\/bulkV2\/?$/i, '').replace(/\/$/, '');
  if (key === 'KWIKAPI_BASE_URL') return value.replace(/\/$/, '');
  if (key === 'SMS_PROVIDER' && !['inboxraja', 'mock', 'msg91', 'twilio'].includes(value)) {
    throw Err.validation('SMS_PROVIDER must be inboxraja, msg91, twilio, or mock');
  }
  if (key === 'KWIKAPI_ENVIRONMENT' && !['uat', 'production'].includes(value)) {
    throw Err.validation('KWIKAPI_ENVIRONMENT must be uat or production');
  }
  return value;
}

function maskSecret(value: string) {
  if (!value) return '';
  if (value.length <= 8) return '********';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

async function hydrateLocalFile() {
  if (!existsSync(localConfigPath)) return;
  const raw = await readFile(localConfigPath, 'utf8');
  const values = JSON.parse(raw) as Partial<RuntimeConfigRecord>;
  for (const [rawKey, rawValue] of Object.entries(values)) {
    const key = rawKey as RuntimeConfigKey;
    if (!ALLOWED_KEYS.has(key) || rawValue == null) continue;
    cache[key] = normalizeValue(key, String(rawValue));
  }
  logger.info({ path: localConfigPath }, 'runtime config hydrated from local file');
}

async function persistLocalFile() {
  await writeFile(localConfigPath, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}
