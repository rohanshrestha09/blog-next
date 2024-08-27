import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthController, getAuthGuard } from 'server/factories/auth';

const authGuard = getAuthGuard();

const authController = getAuthController();

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
