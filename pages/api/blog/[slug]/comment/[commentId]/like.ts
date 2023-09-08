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
import { errorHandler, HttpException } from 'utils/exception';
import { httpResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth());

router.post(async (req, res) => {
  const authUser = req.auth;

  const { commentId } = req.query;

  if (Array.isArray(commentId)) throw new HttpException(400, 'Invalid operation');

  const comment = await prisma.comment.update({
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

  const notificationExists = await prisma.notification.findFirst({
    where: {
      type: NotificationType.LIKE_COMMENT,
      senderId: authUser.id,
      receiverId: comment.userId,
      blogId: comment.blogId,
      commentId: comment.id,
    },
  });

  if (!notificationExists) {
    const notification = await prisma.notification.create({
      data: {
        type: NotificationType.LIKE_COMMENT,
        senderId: authUser.id,
        receiverId: comment.userId,
        blogId: comment.blogId,
        commentId: comment.id,
        description: `${authUser.name} liked your comment.`,
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
