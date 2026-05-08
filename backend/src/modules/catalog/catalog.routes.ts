import { Router } from 'express';

import { requireAuth, requireRole } from '../../middleware/auth';
import { rechargeService } from '../recharge/recharge.service';

const router = Router();

router.get('/catalog/services', requireAuth, async (_req, res, next) => {
  try {
    res.json({ data: { services: await rechargeService.services() } });
  } catch (e) {
    next(e);
  }
});

router.get('/catalog/operators', requireAuth, async (req, res, next) => {
  try {
    res.json({ data: { operators: await rechargeService.operators(req.query.service ? String(req.query.service) : undefined) } });
  } catch (e) {
    next(e);
  }
});

router.get('/catalog/circles', requireAuth, async (_req, res, next) => {
  try {
    res.json({ data: { circles: await rechargeService.circles() } });
  } catch (e) {
    next(e);
  }
});

router.post('/catalog/refresh', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    res.json({ data: await rechargeService.refreshCatalog() });
  } catch (e) {
    next(e);
  }
});

export default router;
