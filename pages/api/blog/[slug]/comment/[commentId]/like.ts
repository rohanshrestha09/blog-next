import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma, User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { errorHandler, HttpException } from 'utils/exception';
import { httpResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth());

router.post(async (req, res) => {
  const authUser = req.auth;

  const { commentId } = req.query;

  if (Array.isArray(commentId)) throw new HttpException(400, 'Invalid operation');

  await prisma.comment.update({
    where: {
      id: Number(commentId),
    },
    data: {
      likedBy: {
        connect: {
          id: authUser.id,
        },
      },
    },
  });

  return res.status(201).json(httpResponse('Liked'));
});

router.delete(async (req, res) => {
  const authUser = req.auth;

  const { commentId } = req.query;

  if (Array.isArray(commentId)) throw new HttpException(400, 'Invalid operation');

  await prisma.comment.update({
    where: {
      id: Number(commentId),
    },
    data: {
      likedBy: {
        disconnect: {
          id: authUser.id,
        },
      },
    },
  });

  return res.status(201).json(httpResponse('Unliked'));
});

export default router.handler({ onError: errorHandler });
