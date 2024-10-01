import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getUserController } from 'server/factories/user';
import { getAuthGuard } from 'server/factories/auth';

const authGuard = getAuthGuard();

const userController = getUserController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .use(authGuard.useAuth({ supressError: true }))
  .get((req, res) => userController.getUserSuggestions(req, res));

export default router.handler({ onError: errorHandler });
