import type { RequestHandler } from 'express';
import { z } from 'zod';

import { walletService } from './wallet.service';

const addMoneyBody = z.object({
  amount: z.coerce.number().min(10).max(100000),
});

export const walletController = {
  profile: (async (req, res, next) => {
    try {
      const data = await walletService.profile(req.auth!.sub);
      res.json({ ok: true, success: true, data });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  balance: (async (req, res, next) => {
    try {
      const wallet = await walletService.balance(req.auth!.sub);
      res.json({ ok: true, success: true, data: { wallet } });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  ledger: (async (req, res, next) => {
    try {
      const limit = Number(req.query.limit ?? 20);
      const ledger = await walletService.ledger(req.auth!.sub, limit);
      res.json({ ok: true, success: true, data: { ledger } });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  createAddMoneyOrder: (async (req, res, next) => {
    try {
      const { amount } = addMoneyBody.parse(req.body);
      const order = await walletService.createAddMoneyOrder(req.auth!.sub, amount);
      res.json({ ok: true, success: true, data: { order } });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
