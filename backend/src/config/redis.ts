import { Redis as UpstashRedis } from '@upstash/redis';
import IORedis from 'ioredis';

import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Redis facade — uniform `setEx / get / del / incrWithExpiry` API.
 *
 * Two implementations:
 *  - Upstash REST (production-ready, serverless-friendly, zero connection pool).
 *  - IORedis    (local Docker fallback for laptop dev).
 *
 * Selection: if `UPSTASH_REDIS_REST_URL` is set, use REST. Otherwise use IORedis
 * against `REDIS_URL`. This keeps `npm run dev` working with `docker-compose up`
 * and prod working against Upstash without code changes.
 */
export interface RedisLike {
  get(key: string): Promise<string | null>;
  setEx(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  /** Atomically increment, set TTL on first hit, return new count. */
  incrWithExpiry(key: string, ttlSeconds: number): Promise<number>;
  /** Raw connect (no-op for Upstash REST). */
  connect(): Promise<void>;
}

class UpstashAdapter implements RedisLike {
  constructor(private client: UpstashRedis) {}
  async get(k: string) {
    const v = await this.client.get<string>(k);
    return v == null ? null : String(v);
  }
  async setEx(k: string, v: string, ttl: number) {
    await this.client.set(k, v, { ex: ttl });
  }
  async del(k: string) {
    await this.client.del(k);
  }
  async incrWithExpiry(k: string, ttl: number) {
    const count = await this.client.incr(k);
    if (count === 1) await this.client.expire(k, ttl);
    return count;
  }
  async connect() {
    /* REST — no persistent connection */
  }
}

class IORedisAdapter implements RedisLike {
  constructor(private client: IORedis) {}
  async get(k: string) {
    return this.client.get(k);
  }
  async setEx(k: string, v: string, ttl: number) {
    await this.client.set(k, v, 'EX', ttl);
  }
  async del(k: string) {
    await this.client.del(k);
  }
  async incrWithExpiry(k: string, ttl: number) {
    const count = await this.client.incr(k);
    if (count === 1) await this.client.expire(k, ttl);
    return count;
  }
  async connect() {
    if (this.client.status === 'wait') await this.client.connect();
  }
}

function build(): RedisLike {
  if (env.SKIP_INFRA_CONNECT) {
    logger.warn('redis: using in-memory facade because SKIP_INFRA_CONNECT=true');
    const store = new Map<string, { value: string; expiresAt: number }>();
    const sweep = (k: string) => {
      const v = store.get(k);
      if (v && v.expiresAt <= Date.now()) store.delete(k);
    };
    return {
      async get(k: string) {
        sweep(k);
        return store.get(k)?.value ?? null;
      },
      async setEx(k: string, value: string, ttlSeconds: number) {
        store.set(k, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
      },
      async del(k: string) {
        store.delete(k);
      },
      async incrWithExpiry(k: string, ttlSeconds: number) {
        sweep(k);
        const current = Number(store.get(k)?.value ?? '0') + 1;
        const existingExpiry = store.get(k)?.expiresAt;
        store.set(k, {
          value: String(current),
          expiresAt: existingExpiry ?? Date.now() + ttlSeconds * 1000,
        });
        return current;
      },
      async connect() {},
    };
  }
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    logger.info('redis: using Upstash REST');
    return new UpstashAdapter(
      new UpstashRedis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      }),
    );
  }
  if (env.REDIS_URL) {
    logger.info('redis: using IORedis (local)');
    return new IORedisAdapter(
      new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true }),
    );
  }
  throw new Error(
    'No Redis configured. Set UPSTASH_REDIS_REST_URL+TOKEN (prod) or REDIS_URL (local).',
  );
}

export const redis: RedisLike = build();
