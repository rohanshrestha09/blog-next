import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthGuard } from 'server/factories/auth';
import { getUserController } from 'server/factories/user';

const authGuard = getAuthGuard();

const userController = getUserController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(authGuard.useAuth(), (req, res) => userController.followUser(req, res));

router.delete(authGuard.useAuth(), (req, res) => userController.unfollowUser(req, res));

export default router.handler({ onError: errorHandler });
