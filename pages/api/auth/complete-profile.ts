import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { AuthGuard } from 'server/guards/auth';
import { AuthController } from 'server/controllers/auth';

const authGuard = new AuthGuard();

const authController = new AuthController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.use(authGuard.useAuth()).patch(authController.completeProfile);

export default router.handler({ onError: errorHandler });
