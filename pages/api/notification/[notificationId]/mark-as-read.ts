import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthGuard } from 'server/factories/auth';
import { getNotificationController } from 'server/factories/notification';

const authGuard = getAuthGuard();

const notificationController = getNotificationController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.use(authGuard.useAuth()).post(notificationController.markAsRead);

export default router.handler({ onError: errorHandler });
