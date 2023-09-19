import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma, User } from 'lib/prisma';
import { validateUser } from 'middlewares/validateUser';
import { session } from 'middlewares/session';
import { errorHandler } from 'utils/exception';
import { parseQuery } from 'utils/parseQuery';
import { getAllResponse } from 'utils/response';
import { getPages } from 'utils';

const router = createRouter<NextApiRequest & { session: Session; user: User }, NextApiResponse>();

router.use(session(), validateUser()).get(async (req, res) => {
  const user = req.user;

  const { take, skip, search, sort, order } = await parseQuery(req.query);

  const count = await prisma.blog.count({
    where: {
      authorId: user.id,
      title: {
        search,
      },
      isPublished: true,
    },
  });

  const blogs = await prisma.blog.findManyWithSession({
    where: {
      authorId: user.id,
      title: {
        search,
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
