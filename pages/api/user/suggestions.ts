import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { exculdeFields, prisma, userFields } from 'lib/prisma';
import { errorHandler } from 'utils/exception';
import { parseQuery } from 'utils/parseQuery';
import { getAllResponse } from 'utils/response';
import { getPages } from 'utils';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
  const { take, skip, search, sort, order } = await parseQuery(req.query);

  const count = await prisma.user.count({
    where: {
      name: {
        search,
      },
    },
  });

  const users = await prisma.user.findMany({
    where: {
      name: {
        search,
      },
    },
    select: {
      ...exculdeFields(userFields, ['password', 'email']),
      _count: {
        select: {
          following: true,
          followedBy: true,
        },
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
