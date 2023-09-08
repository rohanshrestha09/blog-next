import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma, Blog, User, commentFields } from 'lib/prisma';
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

  const { comment } = req.body;

  await prisma.comment.create({
    data: {
      userId: authUser.id,
      blogId: blog.id,
      content: comment,
    },
  });

  return res.status(201).json(httpResponse('Comment Successful'));
});

export default router.handler({ onError: errorHandler });
