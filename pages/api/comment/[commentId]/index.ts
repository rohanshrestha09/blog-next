import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'server/exception';
import { getAuthGuard } from 'server/factories/auth';
import { getCommentController } from 'server/factories/comment';

const authGuard = getAuthGuard();

const commentController = getCommentController();

const router = createRouter<NextApiRequest, NextApiResponse>();

router.use(authGuard.useAuth()).delete(commentController.deleteComment);

export default router.handler({ onError: errorHandler });
