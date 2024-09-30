import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthGuard } from 'server/factories/auth';
import { getBlogController } from 'server/factories/blog';

const authGuard = getAuthGuard();

const blogController = getBlogController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.use(authGuard.useAuth({ supressError: true })).get(blogController.getBlogComments);

export default router.handler({ onError: errorHandler });
