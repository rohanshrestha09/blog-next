import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthGuard } from 'server/factories/auth';
import { getBlogController } from 'server/factories/blog';

const authGuard = getAuthGuard();

const blogController = getBlogController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(authGuard.useAuth({ supressError: true }), (req, res) =>
  blogController.getBlogLikers(req, res),
);

router.post(authGuard.useAuth(), (req, res) => blogController.likeBlog(req, res));

router.delete(authGuard.useAuth(), (req, res) => blogController.unlikeBlog(req, res));

export default router.handler({ onError: errorHandler });
