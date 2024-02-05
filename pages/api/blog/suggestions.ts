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
  const { take, skip, search } = await parseQuery(req.query);

  const results = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM public."Blog" ORDER BY RANDOM() LIMIT ${take};`,
  );

  const ids = results.map((item) => item.id);

  const count = await prisma.blog.count({
    where: {
      id: {
        in: ids,
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
      id: {
        in: ids,
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
  });

  const { currentPage, totalPage } = getPages({ skip, take, count });

  return res
    .status(200)
    .json(getAllResponse('Blogs fetched', { data: blogs, count, currentPage, totalPage }));
});

export default router.handler({ onError: errorHandler });
