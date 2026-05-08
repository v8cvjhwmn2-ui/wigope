import type { RequestHandler } from 'express';
import { z } from 'zod';

import { env } from '../../config/env';
import { runtimeConfig } from '../admin/runtime-config.service';
import { hubbleService } from './hubble.service';

const ssoBody = z.object({ token: z.string().min(1) });
const debitBody = z.object({
  userId: z.string().min(1),
  coins: z.coerce.number().positive(),
  referenceId: z.string().min(1),
  note: z.string().optional(),
});
const reverseBody = z.object({
  userId: z.string().min(1),
  amount: z.coerce.number().positive(),
  referenceId: z.string().min(1),
  transactionId: z.string().optional(),
});

export const requireHubbleSecret: RequestHandler = (req, res, next) => {
  const secret = runtimeConfig.get('HUBBLE_X_SECRET') || env.HUBBLE_X_SECRET;
  if (!secret && env.NODE_ENV !== 'production') return next();
  if (req.header('x-hubble-secret') !== secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

export const hubbleController = {
  issueToken: (async (req, res, next) => {
    try {
      res.json({
        ok: true,
        success: true,
        data: { token: hubbleService.issueSsoToken(req.auth!.sub) },
      });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  sso: (async (req, res, next) => {
    try {
      const { token } = ssoBody.parse(req.body);
      res.json(await hubbleService.sso(token));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  balance: (async (req, res, next) => {
    try {
      const userId = String(req.query.userId ?? '');
      res.json(await hubbleService.balance(userId));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  debit: (async (req, res, next) => {
    try {
      res.json(await hubbleService.debit(debitBody.parse(req.body)));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  reverse: (async (req, res, next) => {
    try {
      res.json(await hubbleService.reverse(reverseBody.parse(req.body)));
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
