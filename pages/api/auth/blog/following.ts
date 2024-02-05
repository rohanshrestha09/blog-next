import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma, User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { session } from 'middlewares/session';
import { errorHandler } from 'utils/exception';
import { parseQuery } from 'utils/parseQuery';
import { getAllResponse } from 'utils/response';
import { getPages } from 'utils';

const router = createRouter<NextApiRequest & { session: Session; auth: User }, NextApiResponse>();

router.use(auth(), session()).get(async (req, res) => {
  const authUser = req.auth;

  const { take, skip, search, sort, order } = await parseQuery(req.query);

  const count = await prisma.blog.count({
    where: {
      author: {
        followedBy: {
          some: {
            id: authUser.id,
          },
        },
      },
      title: {
        contains: search,
        mode: 'insensitive',
      },
      isPublished: true,
    },
  });

  const blogs = await prisma.blog.findManyWithSession({
    where: {
      author: {
        followedBy: {
          some: {
            id: authUser.id,
          },
        },
      },
      title: {
        contains: search,
        mode: 'insensitive',
      },
      isPublished: true,
    },
    session: req.session,
    skip,
    take,
    orderBy: {
      [sort]: order,
    },
  });

  const { currentPage, totalPage } = getPages({ skip, take, count });

  return res
    .status(200)
    .json(getAllResponse('Blogs fetched', { data: blogs, count, currentPage, totalPage }));
});

export default router.handler({ onError: errorHandler });
