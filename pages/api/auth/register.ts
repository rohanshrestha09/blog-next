import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { AuthController } from 'server/controllers/auth';

const authController = new AuthController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(authController.register);

export default router.handler({ onError: errorHandler });

export const config = {
  api: {
    bodyParser: false,
  },
};
