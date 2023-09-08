import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma, User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { errorHandler, HttpException } from 'utils/exception';
import { httpResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth()).delete(async (req, res) => {
  const authUser = req.auth;

  const { commentId } = req.query;

  if (Array.isArray(commentId)) throw new HttpException(400, 'Invalid operation');

  const comment = await prisma.comment.findUniqueOrThrow({
    where: {
      id: Number(commentId),
    },
  });

  if (comment.userId !== authUser.id) throw new HttpException(401, 'Unauthorised');

  await prisma.comment.delete({ where: { id: Number(commentId) } });

  return res.status(201).json(httpResponse('Comment Deleted Successfully'));
});

export default router.handler({ onError: errorHandler });
