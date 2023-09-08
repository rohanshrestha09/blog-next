import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import {
  Blog,
  blogFields,
  commentFields,
  exculdeFields,
  notificationFields,
  NotificationType,
  prisma,
  selectFields,
  User,
  userFields,
} from 'lib/prisma';
import { dispatchNotification } from 'lib/pusher';
import { auth } from 'middlewares/auth';
import { validateBlog } from 'middlewares/validateBlog';
import { errorHandler } from 'utils/exception';
import { getAllResponse, httpResponse } from 'utils/response';
import { parseQuery } from 'utils/parseQuery';
import { getPages } from 'utils';

const router = createRouter<NextApiRequest & { auth: User; blog: Blog }, NextApiResponse>();

router.use(validateBlog());

router.get(async (req, res) => {
  const blog = req.blog;

  const { skip, take } = await parseQuery(req.query);

  const count = await prisma.user.count({
    where: {
      likedBlogs: {
        some: {
          id: blog.id,
        },
      },
    },
  });

  const likes = await prisma.blog
    .findUnique({
      where: {
        id: blog.id,
      },
    })
    .likedBy({
      select: {
        ...exculdeFields(userFields, ['password', 'email']),
        _count: {
          select: {
            following: true,
            followedBy: true,
          },
        },
      },
      skip,
      take,
    });

  const { currentPage, totalPage } = getPages({ skip, take, count });

  return res
    .status(200)
    .json(getAllResponse('Likes fetched', { data: likes, count, currentPage, totalPage }));
});

router.post(auth(), async (req, res) => {
  const blog = req.blog;

  const authUser = req.auth;

  await prisma.blog.update({
    where: {
      id: blog.id,
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
      type: NotificationType.LIKE_BLOG,
      senderId: authUser.id,
      receiverId: blog.authorId,
      blogId: blog.id,
    },
  });

  if (!notificationExists) {
    const notification = await prisma.notification.create({
      data: {
        type: NotificationType.LIKE_BLOG,
        senderId: authUser.id,
        receiverId: blog.authorId,
        blogId: blog.id,
        description: `${authUser.name} liked your blog.`,
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

router.delete(auth(), async (req, res) => {
  const blog = req.blog;

  const authUser = req.auth;

  await prisma.blog.update({
    where: {
      id: blog.id,
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
