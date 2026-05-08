import type { RequestHandler } from 'express';
import { z } from 'zod';

import { authService } from './auth.service';

const mobileSchema = z
  .string()
  .trim()
  .regex(/^(\+?91)?[6-9]\d{9}$/, 'Mobile must be a valid 10-digit Indian number');

const deviceInfoSchema = z
  .object({
    platform: z.string().max(20).optional(),
    model: z.string().max(80).optional(),
    osVersion: z.string().max(40).optional(),
    appVersion: z.string().max(20).optional(),
    fcmToken: z.string().max(512).optional(),
  })
  .optional();

const sendOtpBody = z.object({ mobile: mobileSchema });
const verifyOtpBody = z.object({
  mobile: mobileSchema,
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  deviceInfo: deviceInfoSchema,
});
const refreshBody = z.object({ refreshToken: z.string().min(20) });
const logoutBody = z.object({ refreshToken: z.string().min(20) });

const reqCtx = (req: Parameters<RequestHandler>[0]) => ({
  ip: req.ip ?? 'unknown',
  userAgent: req.header('user-agent') ?? undefined,
});

export const authController = {
  sendOtp: (async (req, res, next) => {
    try {
      const { mobile } = sendOtpBody.parse(req.body);
      const data = await authService.sendOtp({ mobile, ...reqCtx(req) });
      res.json({ ok: true, success: true, data });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  verifyOtp: (async (req, res, next) => {
    try {
      const body = verifyOtpBody.parse(req.body);
      const data = await authService.verifyOtp({ ...body, ...reqCtx(req) });
      res.json({ ok: true, success: true, data });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  refresh: (async (req, res, next) => {
    try {
      const { refreshToken } = refreshBody.parse(req.body);
      const data = await authService.refresh({ refreshToken, ...reqCtx(req) });
      res.json({
        ok: true,
        success: true,
        data: { accessToken: data.accessToken, refreshToken: data.refreshToken },
      });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  logout: (async (req, res, next) => {
    try {
      const { refreshToken } = logoutBody.parse(req.body);
      await authService.logout({ refreshToken });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  me: (async (req, res, next) => {
    try {
      if (!req.auth) return next();
      const user = await authService.me(req.auth.sub);
      res.json({ ok: true, success: true, data: { user } });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
