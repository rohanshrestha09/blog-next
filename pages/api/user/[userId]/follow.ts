import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthGuard } from 'server/factories/auth';
import { getUserController } from 'server/factories/user';

const authGuard = getAuthGuard();

const userController = getUserController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.use(authGuard.useAuth()).post(userController.followUser).delete(userController.unfollowUser);

export default router.handler({ onError: errorHandler });
