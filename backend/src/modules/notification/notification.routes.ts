import { Router } from 'express';

import { requireAuth } from '../../middleware/auth';
import { notificationController } from './notification.controller';

const router = Router();

router.use(requireAuth);
router.get('/notifications', notificationController.list);
router.post('/notifications/read-all', notificationController.markAllRead);
router.post('/notifications/:id/read', notificationController.markRead);

export default router;
