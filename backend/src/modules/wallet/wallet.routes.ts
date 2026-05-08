import { Router } from 'express';

import { requireAuth } from '../../middleware/auth';
import { walletController } from './wallet.controller';

const router = Router();

router.use(requireAuth);
router.get('/profile', walletController.profile);
router.get('/wallet', walletController.balance);
router.get('/wallet/ledger', walletController.ledger);
router.post('/wallet/add-money/order', walletController.createAddMoneyOrder);

export default router;
