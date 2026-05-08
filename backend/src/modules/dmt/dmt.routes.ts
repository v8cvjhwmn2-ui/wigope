import { Router } from 'express';

import { requireAuth } from '../../middleware/auth';
import { beneficiarySchema, dmtService, senderSchema, transferSchema } from './dmt.service';

const router = Router();

router.use(requireAuth);

router.get('/dmt/sender', async (req, res, next) => {
  try {
    const sender = await dmtService.sender(req.auth!.sub);
    res.json({ ok: true, success: true, data: { sender } });
  } catch (e) {
    next(e);
  }
});

router.post('/dmt/sender', async (req, res, next) => {
  try {
    const sender = await dmtService.registerSender(req.auth!.sub, senderSchema.parse(req.body));
    res.status(201).json({ ok: true, success: true, data: { sender } });
  } catch (e) {
    next(e);
  }
});

router.get('/dmt/beneficiaries', async (req, res, next) => {
  try {
    const beneficiaries = await dmtService.beneficiaries(req.auth!.sub);
    res.json({ ok: true, success: true, data: { beneficiaries } });
  } catch (e) {
    next(e);
  }
});

router.post('/dmt/beneficiaries', async (req, res, next) => {
  try {
    const beneficiary = await dmtService.addBeneficiary(req.auth!.sub, beneficiarySchema.parse(req.body));
    res.status(201).json({ ok: true, success: true, data: { beneficiary } });
  } catch (e) {
    next(e);
  }
});

router.delete('/dmt/beneficiaries/:id', async (req, res, next) => {
  try {
    await dmtService.deleteBeneficiary(req.auth!.sub, req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.post('/dmt/transfers', async (req, res, next) => {
  try {
    const transfer = await dmtService.transfer(req.auth!.sub, transferSchema.parse(req.body));
    res.status(201).json({ ok: true, success: true, data: { transfer } });
  } catch (e) {
    next(e);
  }
});

router.get('/dmt/transfers', async (req, res, next) => {
  try {
    const transfers = await dmtService.transfers(req.auth!.sub);
    res.json({ ok: true, success: true, data: { transfers } });
  } catch (e) {
    next(e);
  }
});

export default router;
