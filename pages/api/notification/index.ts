import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { notificationFields, prisma, User, NotificationStatus } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { errorHandler } from 'utils/exception';
import { parseQuery } from 'utils/parseQuery';
import { getPages } from 'utils';

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth()).get(async (req, res) => {
  const authUser = req.auth;

  const { skip, take } = await parseQuery(req.query);

  const count = await prisma.notification.count({
    where: {
      receiver: {
        id: authUser.id,
      },
    },
  });

  const read = await prisma.notification.count({
    where: {
      receiver: {
        id: authUser.id,
      },
      status: NotificationStatus.READ,
    },
  });

  const unread = await prisma.notification.count({
    where: {
      receiver: {
        id: authUser.id,
      },
      status: NotificationStatus.UNREAD,
    },
  });

  const notifications = await prisma.notification.findMany({
    where: {
      receiver: {
        id: authUser.id,
      },
    },
    select: {
      ...notificationFields,
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      blog: {
        select: {
          id: true,
          slug: true,
          title: true,
          image: true,
        },
      },
      comment: {
        select: {
          id: true,
          content: true,
        },
      },
    },
    skip,
    take,
    orderBy: {
      createdAt: 'desc',
    },
  });

  const { currentPage, totalPage } = getPages({ skip, take, count });

  return res.status(201).json({
    data: notifications,
    count,
    read,
    unread,
    currentPage,
    totalPage,
    message: 'Notification fetched',
  });
});

export default router.handler({ onError: errorHandler });
