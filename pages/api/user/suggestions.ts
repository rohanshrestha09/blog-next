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
  const { take, skip, search, sort, order } = await parseQuery(req.query);

  const count = await prisma.user.count({
    where: {
      name: {
        search,
      },
    },
  });

  const users = await prisma.user.findManyWithSession({
    session: req.session,
    where: {
      name: {
        search,
      },
    },
    take,
    skip,
    orderBy: {
      [sort]: order,
    },
  });

  const { currentPage, totalPage } = getPages({ skip, take, count });

  return res
    .status(200)
    .json(getAllResponse('Users fetched', { data: users, count, currentPage, totalPage }));
});

export default router.handler({ onError: errorHandler });
