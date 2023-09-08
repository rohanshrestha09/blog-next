import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import {
  prisma,
  Blog,
  User,
  commentFields,
  NotificationType,
  notificationFields,
  selectFields,
  userFields,
  blogFields,
} from 'lib/prisma';
import { dispatchNotification } from 'lib/pusher';
import { auth } from 'middlewares/auth';
import { validateBlog } from 'middlewares/validateBlog';
import { errorHandler } from 'utils/exception';
import { parseQuery } from 'utils/parseQuery';
import { getAllResponse, httpResponse } from 'utils/response';
import { getPages } from 'utils';

const router = createRouter<NextApiRequest & { auth: User; blog: Blog }, NextApiResponse>();

router.use(validateBlog());

router.get(async (req, res) => {
  const blog = req.blog;

  const { skip, take } = await parseQuery(req.query);

  const count = await prisma.comment.count({
    where: {
      blogId: blog.id,
    },
  });

  const comments = await prisma.blog
    .findUnique({
      where: {
        id: blog.id,
      },
    })
    .comments({
      select: {
        ...commentFields,
        _count: {
          select: {
            likedBy: true,
          },
        },
      },
      skip,
      take,
    });

  const { currentPage, totalPage } = getPages({ skip, take, count });

  return res
    .status(200)
    .json(getAllResponse('Comments fetched', { data: comments, count, currentPage, totalPage }));
});

router.use(auth()).post(async (req, res) => {
  const authUser = req.auth;

  const blog = req.blog;

  const { comment: content } = req.body;

  const comment = await prisma.comment.create({
    data: {
      userId: authUser.id,
      blogId: blog.id,
      content,
    },
    select: {
      id: true,
      blog: true,
    },
  });

  const notification = await prisma.notification.create({
    data: {
      type: NotificationType.POST_COMMENT,
      senderId: authUser.id,
      receiverId: comment.blog.authorId,
      blogId: comment.blog.id,
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

  return res.status(201).json(httpResponse('Comment Successful'));
});

export default router.handler({ onError: errorHandler });
