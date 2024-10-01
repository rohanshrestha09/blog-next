import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthGuard } from 'server/factories/auth';
import { getBlogController } from 'server/factories/blog';

const authGuard = getAuthGuard();

const blogController = getBlogController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(authGuard.useAuth(), (req, res) => blogController.bookmarkBlog(req, res));

router.delete(authGuard.useAuth(), (req, res) => blogController.unbookmarkBlog(req, res));

export default router.handler({ onError: errorHandler });
