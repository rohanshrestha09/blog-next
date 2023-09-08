import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { NotificationStatus, prisma, User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { errorHandler } from 'utils/exception';
import { httpResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth()).post(async (req, res) => {
  const authUser = req.auth;

  await prisma.notification.updateMany({
    where: {
      receiverId: authUser.id,
    },
    data: {
      status: NotificationStatus.READ,
    },
  });

  return res.status(201).json(httpResponse('Notifications updated'));
});

export default router.handler({ onError: errorHandler });
