import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma, User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { validateUser } from 'middlewares/validateUser';
import { errorHandler } from 'utils/exception';
import { httpResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { auth: User; user: User }, NextApiResponse>();

router.use(auth()).use(validateUser());

router.post(async (req, res) => {
  const authUser = req.auth;

  const user = req.user;

  await prisma.user.update({
    where: { id: authUser.id },
    data: {
      following: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  return res.status(200).json(httpResponse('Followed'));
});

router.delete(async (req, res) => {
  const authUser = req.auth;

  const user = req.user;

  await prisma.user.update({
    where: { id: authUser.id },
    data: {
      following: {
        disconnect: {
          id: user.id,
        },
      },
    },
  });

  return res.status(200).json(httpResponse('Unfollowed'));
});

export default router.handler({ onError: errorHandler });
