import type { RequestHandler } from 'express';
import { z } from 'zod';

import { transactionService } from './transaction.service';

const mockBody = z.object({
  kind: z.enum(['success', 'failure', 'cashback']),
});

export const transactionController = {
  list: (async (req, res, next) => {
    try {
      const transactions = await transactionService.list(req.auth!.sub, {
        status: req.query.status as string | undefined,
        type: req.query.type as string | undefined,
        limit: Number(req.query.limit ?? 30),
      });
      res.json({ ok: true, success: true, data: { transactions } });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  detail: (async (req, res, next) => {
    try {
      const transaction = await transactionService.detail(req.auth!.sub, String(req.params.id));
      res.json({ ok: true, success: true, data: { transaction } });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  receipt: (async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const pdf = await transactionService.receipt(req.auth!.sub, id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="wigope-receipt-${id}.pdf"`);
      res.send(pdf);
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  mockEvent: (async (req, res, next) => {
    try {
      const { kind } = mockBody.parse(req.body);
      const transaction = await transactionService.createMockEvent(req.auth!.sub, kind);
      res.json({ ok: true, success: true, data: { transaction } });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
