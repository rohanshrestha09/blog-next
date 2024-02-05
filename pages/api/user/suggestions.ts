import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma } from 'lib/prisma';
import { session } from 'middlewares/session';
import { errorHandler } from 'utils/exception';
import { parseQuery } from 'utils/parseQuery';
import { getAllResponse } from 'utils/response';
import { getPages } from 'utils';

const router = createRouter<NextApiRequest & { session: Session }, NextApiResponse>();

router.use(session());

router.get(async (req, res) => {
  const { take, skip, search } = await parseQuery(req.query);

  const results = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `SELECT id FROM public."User" ORDER BY RANDOM() LIMIT ${take};`,
  );

  const ids = results.map((item) => item.id);

  const count = await prisma.user.count({
    where: {
      id: {
        in: ids,
      },
      name: {
        contains: search,
        mode: 'insensitive',
      },
    },
  });

  const users = await prisma.user.findManyWithSession({
    session: req.session,
    where: {
      id: {
        in: ids,
      },
      name: {
        contains: search,
        mode: 'insensitive',
      },
    },
    take,
    skip,
  });

  const { currentPage, totalPage } = getPages({ skip, take, count });

  return res
    .status(200)
    .json(getAllResponse('Users fetched', { data: users, count, currentPage, totalPage }));
});

export default router.handler({ onError: errorHandler });
