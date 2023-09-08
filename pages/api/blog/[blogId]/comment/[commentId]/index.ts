import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma, Blog, User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { validateBlog } from 'middlewares/validateBlog';
import { errorHandler, HttpException } from 'utils/exception';
import { httpResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { auth: User; blog: Blog }, NextApiResponse>();

router.use(auth(), validateBlog()).delete(async (req, res) => {
  const { commentId } = req.query;

  if (Array.isArray(commentId)) throw new HttpException(400, 'Invalid operation');

  await prisma.comment.delete({ where: { id: Number(commentId) } });

  return res.status(201).json(httpResponse('Comment Deleted Successfully'));
});

export default router.handler({ onError: errorHandler });
