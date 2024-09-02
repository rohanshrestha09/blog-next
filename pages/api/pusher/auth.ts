import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthGuard } from 'server/factories/auth';
import { getPusherController } from 'server/factories/pusher';

const authGuard = getAuthGuard();

const pusherController = getPusherController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.use(authGuard.useAuth()).post(pusherController.authorizeChannel);

export default router.handler({ onError: errorHandler });
