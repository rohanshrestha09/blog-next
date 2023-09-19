import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma } from 'lib/prisma';
import { session } from 'middlewares/session';
import { getPages } from 'utils';
import { errorHandler } from 'utils/exception';
import { parseQuery } from 'utils/parseQuery';
import { getAllResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { session: Session }, NextApiResponse>();

router.use(session());

router.get(async (req, res) => {
  const { take, skip, search, sort, order } = await parseQuery(req.query);

  const count = await prisma.blog.count({
    where: {
      title: {
        search,
      },
      isPublished: true,
    },
  });

  const blogs = await prisma.blog.findManyWithSession({
    where: {
      title: { search },
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
