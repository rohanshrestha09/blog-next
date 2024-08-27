import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { AuthController } from 'server/controllers/auth';
import { errorHandler } from 'server/exception';
import { AuthGuard } from 'server/guards/auth';

const authGuard = new AuthGuard();

const authController = new AuthController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.use(authGuard.useAuth()).delete(authController.removeImage);

export default router.handler({ onError: errorHandler });
