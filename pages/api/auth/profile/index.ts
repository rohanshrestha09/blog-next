import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { AuthGuard } from 'server/guards/auth';
import { AuthController } from 'server/controllers/auth';

const authGuard = new AuthGuard();

const authController = new AuthController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.use(authGuard.useAuth());

router.get(authController.getProfile);

router.put(authController.updateProfile);

router.delete(authController.deleteProfile);

export default router.handler({ onError: errorHandler });

export const config = {
  api: {
    bodyParser: false,
  },
};
