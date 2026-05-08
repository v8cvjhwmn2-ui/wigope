import { Router } from 'express';

import { requireAuth } from '../../middleware/auth';
import { rechargeService, billPaymentSchema, fetchBillSchema, mobileRechargeSchema } from './recharge.service';

const router = Router();

router.use(requireAuth);

router.get('/detect-operator', async (req, res, next) => {
  try {
    const data = await rechargeService.detectOperator(String(req.query.number ?? ''));
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

router.get('/mobile-plans', async (req, res, next) => {
  try {
    const data = await rechargeService.mobilePlans(String(req.query.opid ?? ''), String(req.query.circle ?? req.query.circleCode ?? ''));
    res.json({ data: { plans: data } });
  } catch (e) {
    next(e);
  }
});

router.get('/dth-plans', async (req, res, next) => {
  try {
    const data = await rechargeService.dthPlans(String(req.query.opid ?? ''));
    res.json({ data: { plans: data } });
  } catch (e) {
    next(e);
  }
});

router.get('/r-offers', async (req, res, next) => {
  try {
    const data = await rechargeService.rOffers(String(req.query.opid ?? ''), String(req.query.mobile ?? ''));
    res.json({ data: { offers: data } });
  } catch (e) {
    next(e);
  }
});

router.post('/fetch-bill', async (req, res, next) => {
  try {
    const data = await rechargeService.fetchBill(fetchBillSchema.parse(req.body));
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

router.post('/mobile', async (req, res, next) => {
  try {
    const data = await rechargeService.initiateMobileRecharge(req.auth!.sub, mobileRechargeSchema.parse(req.body));
    res.status(201).json({ data: { transaction: data } });
  } catch (e) {
    next(e);
  }
});

router.post('/dth', async (req, res, next) => {
  try {
    const data = await rechargeService.initiateDthRecharge(req.auth!.sub, mobileRechargeSchema.parse(req.body));
    res.status(201).json({ data: { transaction: data } });
  } catch (e) {
    next(e);
  }
});

router.post('/postpaid', async (req, res, next) => {
  try {
    const data = await rechargeService.initiateBillPayment(req.auth!.sub, billPaymentSchema.parse({ ...req.body, service: 'postpaid' }));
    res.status(201).json({ data: { transaction: data } });
  } catch (e) {
    next(e);
  }
});

router.post('/bill-payment', async (req, res, next) => {
  try {
    const data = await rechargeService.initiateBillPayment(req.auth!.sub, billPaymentSchema.parse(req.body));
    res.status(201).json({ data: { transaction: data } });
  } catch (e) {
    next(e);
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const data = await rechargeService.transactions(req.auth!.sub, {
      status: req.query.status ? String(req.query.status) : undefined,
      service: req.query.service ? String(req.query.service) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ data: { transactions: data } });
  } catch (e) {
    next(e);
  }
});

router.get('/transactions/:orderId', async (req, res, next) => {
  try {
    const data = await rechargeService.transaction(req.auth!.sub, req.params.orderId);
    res.json({ data: { transaction: data } });
  } catch (e) {
    next(e);
  }
});

router.post('/transactions/:orderId/poll-status', async (req, res, next) => {
  try {
    const data = await rechargeService.pollStatus(req.auth!.sub, req.params.orderId);
    res.json({ data: { transaction: data } });
  } catch (e) {
    next(e);
  }
});

export default router;
