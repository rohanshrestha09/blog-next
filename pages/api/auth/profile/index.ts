import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthController, getAuthGuard } from 'server/factories/auth';

const authGuard = getAuthGuard();

const authController = getAuthController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.use(authGuard.useAuth());

router.get((req, res) => authController.getProfile(req, res));

router.put((req, res) => authController.updateProfile(req, res));

router.delete((req, res) => authController.deleteProfile(req, res));

export default router.handler({ onError: errorHandler });

export const config = {
  api: {
    bodyParser: false,
  },
};
