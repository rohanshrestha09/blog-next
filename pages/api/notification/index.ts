import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import {
  notificationFields,
  prisma,
  User,
  NotificationStatus,
  selectFields,
  userFields,
  blogFields,
  commentFields,
} from 'lib/prisma';
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
      receiverId: authUser.id,
    },
  });

  const read = await prisma.notification.count({
    where: {
      receiverId: authUser.id,
      status: NotificationStatus.READ,
    },
  });

  const unread = await prisma.notification.count({
    where: {
      receiverId: authUser.id,
      status: NotificationStatus.UNREAD,
    },
  });

  const notifications = await prisma.user
    .findUnique({
      where: {
        id: authUser.id,
      },
    })
    .receivedNotifications({
      select: {
        ...notificationFields,
        sender: {
          select: selectFields(userFields, ['id', 'name', 'image']),
        },
        blog: {
          select: selectFields(blogFields, ['id', 'slug', 'title', 'image']),
        },
        comment: {
          select: selectFields(commentFields, ['id', 'content']),
        },
      },

      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });

  const { currentPage, totalPage } = getPages({ skip, take, count });

  return res.status(200).json({
    result: notifications,
    count,
    read,
    unread,
    currentPage,
    totalPage,
    message: 'Notification fetched',
  });
});

export default router.handler({ onError: errorHandler });
