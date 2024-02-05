import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma, User } from 'lib/prisma';
import { session } from 'middlewares/session';
import { auth } from 'middlewares/auth';
import { errorHandler } from 'utils/exception';
import { parseQuery } from 'utils/parseQuery';
import { getAllResponse } from 'utils/response';
import { getPages } from 'utils';

const router = createRouter<NextApiRequest & { session: Session; auth: User }, NextApiResponse>();

router.use(session(), auth()).get(async (req, res) => {
  const authUser = req.auth;

  const { take, skip, search, sort, order } = await parseQuery(req.query);

  const count = await prisma.user.count({
    where: {
      followedBy: {
        some: {
          id: authUser.id,
        },
      },
      following: {
        some: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
    },
  });

  const following = await prisma.user.findManyWithSession({
    session: req.session,
    where: {
      followedBy: {
        some: {
          id: authUser.id,
        },
      },
      following: {
        some: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
    },
    skip,
    take,
    orderBy: {
      [sort]: order,
    },
  });

  const { currentPage, totalPage } = getPages({ skip, take, count });

  return res
    .status(200)
    .json(getAllResponse('Following fetched', { data: following, count, currentPage, totalPage }));
});

export default router.handler({ onError: errorHandler });
