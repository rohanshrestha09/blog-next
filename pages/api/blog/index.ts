import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthGuard } from 'server/factories/auth';
import { getBlogController } from 'server/factories/blog';

const authGuard = getAuthGuard();

const blogController = getBlogController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(authGuard.useAuth(), blogController.createBlog);

router.get(authGuard.useAuth({ supressError: true }), blogController.getAllBlogs);

export default router.handler({ onError: errorHandler });

export const config = {
  api: {
    bodyParser: false,
  },
};
