import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import {
  blogFields,
  commentFields,
  notificationFields,
  NotificationType,
  prisma,
  selectFields,
  User,
  userFields,
} from 'lib/prisma';
import { dispatchNotification } from 'lib/pusher';
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

  const notificationExists = await prisma.notification.findFirst({
    where: {
      type: NotificationType.FOLLOW_USER,
      senderId: authUser.id,
      receiverId: user.id,
    },
  });

  if (!notificationExists) {
    const notification = await prisma.notification.create({
      data: {
        type: NotificationType.FOLLOW_USER,
        senderId: authUser.id,
        receiverId: user.id,
        description: `${authUser.name} followed you.`,
      },
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
    });

    dispatchNotification(notification);
  }

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
