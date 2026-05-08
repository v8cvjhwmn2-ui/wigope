import { Router } from 'express';

import { requireAuth } from '../../middleware/auth';
import { hubbleController, requireHubbleSecret } from './hubble.controller';

const router = Router();

router.post('/rewards/sso-token', requireAuth, hubbleController.issueToken);

router.post('/hubble/sso', requireHubbleSecret, hubbleController.sso);
router.get('/hubble/balance', requireHubbleSecret, hubbleController.balance);
router.post('/hubble/debit', requireHubbleSecret, hubbleController.debit);
router.post('/hubble/reverse', requireHubbleSecret, hubbleController.reverse);

export default router;
