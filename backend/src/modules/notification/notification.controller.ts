import type { RequestHandler } from 'express';

import { notificationService } from './notification.service';

export const notificationController = {
  list: (async (req, res, next) => {
    try {
      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await notificationService.list(req.auth!.sub, unreadOnly);
      const unreadCount = await notificationService.unreadCount(req.auth!.sub);
      res.json({ ok: true, success: true, data: { notifications, unreadCount } });
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  markRead: (async (req, res, next) => {
    try {
      await notificationService.markRead(req.auth!.sub, String(req.params.id));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,

  markAllRead: (async (req, res, next) => {
    try {
      await notificationService.markAllRead(req.auth!.sub);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }) as RequestHandler,
};
