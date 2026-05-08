import { Router } from 'express';

import { requireAuth } from '../../middleware/auth';
import { transactionController } from './transaction.controller';

const router = Router();

router.use(requireAuth);
router.get('/transactions', transactionController.list);
router.get('/transactions/:id', transactionController.detail);
router.get('/transactions/:id/receipt.pdf', transactionController.receipt);

export default router;
