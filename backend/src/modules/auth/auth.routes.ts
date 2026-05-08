import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { requireAuth } from '../../middleware/auth';
import { loginAttemptLimiter } from '../../middleware/security';
import { authController } from './auth.controller';

const router = Router();

// Outer rate-limit guard layered on top of the per-mobile/per-IP limiters in
// otp.service. Generous — meant to bat away script-kiddies, not real users.
const otpFloodGuard = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/send-otp', otpFloodGuard, authController.sendOtp);
router.post('/verify-otp', loginAttemptLimiter, authController.verifyOtp);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
