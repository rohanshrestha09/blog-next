import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { Blog, prisma, User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { validateBlog } from 'middlewares/validateBlog';
import { errorHandler } from 'utils/exception';
import { httpResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { auth: User; blog: Blog }, NextApiResponse>();

router.use(auth(), validateBlog());

router.post(async (req, res) => {
  const blog = req.blog;

  const authUser = req.auth;

  await prisma.user.update({
    where: {
      id: authUser.id,
    },
    data: {
      bookmarkedBlogs: {
        connect: {
          id: blog.id,
        },
      },
    },
  });

  return res.status(201).json(httpResponse('Bookmarked'));
});

router.delete(async (req, res) => {
  const blog = req.blog;

  const authUser = req.auth;

  await prisma.user.update({
    where: {
      id: authUser.id,
    },
    data: {
      bookmarkedBlogs: {
        disconnect: {
          id: blog.id,
        },
      },
    },
  });

  return res.status(201).json(httpResponse('Unbookmarked'));
});

export default router.handler({ onError: errorHandler });
