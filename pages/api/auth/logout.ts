import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthController, getAuthGuard } from 'server/factories/auth';

const authGuard = getAuthGuard();

const authController = getAuthController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.use(authGuard.useAuth()).delete(authController.logout);

export default router.handler({ onError: errorHandler });
