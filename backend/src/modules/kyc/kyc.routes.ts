import { Router } from 'express';

import { requireAuth, requireRole } from '../../middleware/auth';
import { kycRejectSchema, kycService, kycSubmitSchema } from './kyc.service';

const router = Router();

router.get('/kyc/status', requireAuth, async (req, res, next) => {
  try {
    const data = await kycService.status(req.auth!.sub);
    res.json({ ok: true, success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/kyc/submit', requireAuth, async (req, res, next) => {
  try {
    const data = await kycService.submit(req.auth!.sub, kycSubmitSchema.parse(req.body));
    res.status(201).json({ ok: true, success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/admin/kyc/pending', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const submissions = await kycService.pending();
    res.json({ ok: true, success: true, data: { submissions } });
  } catch (e) {
    next(e);
  }
});

router.post('/admin/kyc/:id/approve', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const data = await kycService.approve(req.auth!.sub, String(req.params.id));
    res.json({ ok: true, success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/admin/kyc/:id/reject', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { reason } = kycRejectSchema.parse(req.body);
    const data = await kycService.reject(req.auth!.sub, String(req.params.id), reason);
    res.json({ ok: true, success: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;
