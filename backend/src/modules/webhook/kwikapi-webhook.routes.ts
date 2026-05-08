import { Router } from 'express';

import { rechargeService } from '../recharge/recharge.service';

const router = Router();

router.post('/kwikapi', async (req, res, next) => {
  try {
    const rawBody = (req as typeof req & { rawBody?: string }).rawBody ?? JSON.stringify(req.body ?? {});
    const data = await rechargeService.handleWebhook(rawBody, String(req.header('x-kwikapi-signature') ?? ''));
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

export default router;
