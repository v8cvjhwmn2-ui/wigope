import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env, corsOrigins } from './config/env';
import { connectMongo } from './config/db';
import { redis } from './config/redis';
import { errorHandler, notFound } from './middleware/error';
import { enforceHttps, rawBodySaver, requestLogger, sanitizeRequest } from './middleware/security';
import { logger } from './utils/logger';

import authRoutes from './modules/auth/auth.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import hubbleRoutes from './modules/hubble/hubble.routes';
import transactionRoutes from './modules/transaction/transaction.routes';
import notificationRoutes from './modules/notification/notification.routes';
import catalogRoutes from './modules/catalog/catalog.routes';
import dmtRoutes from './modules/dmt/dmt.routes';
import kycRoutes from './modules/kyc/kyc.routes';
import rechargeRoutes from './modules/recharge/recharge.routes';
import kwikapiWebhookRoutes from './modules/webhook/kwikapi-webhook.routes';
import adminDashboardRoutes from './modules/admin/admin-dashboard.routes';
import runtimeConfigRoutes from './modules/admin/runtime-config.routes';
import { runtimeConfig } from './modules/admin/runtime-config.service';

async function bootstrap() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(enforceHttps);
  app.use(
    helmet({
      hsts:
        env.NODE_ENV === 'production'
          ? { maxAge: 15552000, includeSubDomains: true, preload: true }
          : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS origin not allowed'));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb', verify: rawBodySaver }));
  app.use(express.urlencoded({ extended: false }));
  app.use(sanitizeRequest);
  app.use(requestLogger);

  app.use(
    '/api/',
    rateLimit({ windowMs: 60_000, limit: 240, standardHeaders: true, legacyHeaders: false }),
  );

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'wigope-pay-backend', version: '0.1.0', env: env.NODE_ENV });
  });
  app.get('/api/v1/health', (_req, res) => {
    res.json({ ok: true, service: 'wigope-pay-backend', version: '0.1.0', env: env.NODE_ENV });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1', walletRoutes);
  app.use('/api/v1', hubbleRoutes);
  app.use('/api/v1', transactionRoutes);
  app.use('/api/v1', notificationRoutes);
  app.use('/api/v1', catalogRoutes);
  app.use('/api/v1', kycRoutes);
  app.use('/api/v1', dmtRoutes);
  app.use('/api/v1', adminDashboardRoutes);
  app.use('/api/v1', runtimeConfigRoutes);
  app.use('/api/v1/recharge', rechargeRoutes);
  app.use('/api/v1/webhooks', kwikapiWebhookRoutes);

  app.use(notFound);
  app.use(errorHandler);

  if (env.SKIP_INFRA_CONNECT) {
    logger.warn('mongo and redis connections skipped for local/dev run');
  } else {
    await connectMongo();
    await redis.connect().catch((e) => logger.warn({ e }, 'redis connect deferred'));
    await runtimeConfig.hydrate();
  }

  app.listen(env.PORT, () => {
    logger.info(`Wigope API listening on :${env.PORT} (${env.NODE_ENV})`);
  });
}

bootstrap().catch((e) => {
  logger.fatal({ e }, 'failed to start');
  process.exit(1);
});
