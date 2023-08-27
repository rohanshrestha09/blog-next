import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { errorHandler, HttpException } from 'utils/exception';
import { httpResponse } from 'utils/response';
import { User } from 'interface/models';

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth()).post(async (req, res) => {
  const { userId } = req.query;

  if (Array.isArray(userId)) throw new HttpException(400, 'Not allowed');

  const authUser = req.auth;

  await prisma.user.update({
    where: { id: authUser.id },
    data: {
      following: {
        connect: {
          id: userId,
        },
      },
    },
  });

  return res.status(200).json(httpResponse('Followed'));
});

router.use(auth()).delete(async (req, res) => {
  const { userId } = req.query;

  if (Array.isArray(userId)) throw new HttpException(400, 'Not allowed');

  const authUser = req.auth;

  await prisma.user.update({
    where: { id: authUser.id },
    data: {
      following: {
        disconnect: {
          id: userId,
        },
      },
    },
  });

  return res.status(200).json(httpResponse('Unfollowed'));
});

export default router.handler({ onError: errorHandler });
