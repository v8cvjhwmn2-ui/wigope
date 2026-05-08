import { Router } from 'express';
import { z } from 'zod';

import { env } from '../../config/env';
import { requireAuth, requireRole } from '../../middleware/auth';
import { randomNumeric } from '../../utils/crypto';
import { Err } from '../../utils/errors';
import { sms } from '../sms/inboxraja.service';
import { runtimeConfig } from './runtime-config.service';

const router = Router();

const settingsBody = z.object({
  settings: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])),
});

const testSmsBody = z.object({
  mobile: z.string().regex(/^(\+?91)?[6-9]\d{9}$/, 'Mobile must be a valid Indian number'),
});

const adminGuard: import('express').RequestHandler = (req, res, next) => {
  const headerSecret = req.header('x-admin-secret');
  if (env.ADMIN_PANEL_SECRET && headerSecret === env.ADMIN_PANEL_SECRET) {
    req.auth = { sub: 'admin-runtime', role: 'admin' };
    return next();
  }
  return requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err);
    return requireRole('admin')(req, res, next);
  });
};

router.use(adminGuard);

router.get('/admin/runtime-config', (_req, res) => {
  res.json({
    ok: true,
    success: true,
    data: {
      status: runtimeConfig.status(),
      settings: runtimeConfig.snapshot(),
    },
  });
});

router.put('/admin/runtime-config', async (req, res, next) => {
  try {
    const body = settingsBody.parse(req.body);
    const settings = await runtimeConfig.update(body.settings, req.auth?.sub ?? 'admin');
    res.json({
      ok: true,
      success: true,
      data: {
        status: runtimeConfig.status(),
        settings,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.post('/admin/runtime-config/test-sms', async (req, res, next) => {
  try {
    const body = testSmsBody.parse(req.body);
    if (runtimeConfig.get('SMS_PROVIDER') !== 'inboxraja') {
      throw Err.validation('SMS_PROVIDER must be inboxraja before sending a live test SMS');
    }
    const otp = randomNumeric(6);
    await sms.sendOtp({ mobile: body.mobile, otp });
    const data = { sentTo: maskMobile(body.mobile), otpLength: otp.length };
    res.json({ ok: true, success: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;

function maskMobile(value: string) {
  const digits = value.replace(/\D/g, '').slice(-10);
  return digits.length === 10 ? `+91 ${digits.slice(0, 2)}****${digits.slice(-4)}` : '+91 **********';
}
