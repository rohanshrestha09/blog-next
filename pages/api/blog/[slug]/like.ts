import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthGuard } from 'server/factories/auth';
import { getBlogController } from 'server/factories/blog';

const authGuard = getAuthGuard();

const blogController = getBlogController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(authGuard.useAuth({ supressError: true }), blogController.getBlogLikers);

router.post(authGuard.useAuth(), blogController.likeBlog);

router.delete(authGuard.useAuth(), blogController.unlikeBlog);

export default router.handler({ onError: errorHandler });
