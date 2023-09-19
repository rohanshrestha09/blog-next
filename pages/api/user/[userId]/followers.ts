import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma, User } from 'lib/prisma';
import { session } from 'middlewares/session';
import { validateUser } from 'middlewares/validateUser';
import { errorHandler } from 'utils/exception';
import { getAllResponse } from 'utils/response';
import { parseQuery } from 'utils/parseQuery';
import { getPages } from 'utils';

const router = createRouter<NextApiRequest & { session: Session; user: User }, NextApiResponse>();

router.use(session());

router.use(validateUser()).get(async (req, res) => {
  const user = req.user;

  const { take, skip, search, sort, order } = await parseQuery(req.query);

  const count = await prisma.user.count({
    where: {
      following: {
        some: {
          id: user.id,
        },
      },
      followedBy: {
        some: {
          name: {
            search,
          },
        },
      },
    },
  });

  const followers = await prisma.user.findManyWithSession({
    session: req.session,
    where: {
      following: {
        some: {
          id: user.id,
        },
      },
      followedBy: {
        some: {
          name: {
            search,
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
    .json(getAllResponse('Followers fetched', { data: followers, count, currentPage, totalPage }));
});

export default router.handler({ onError: errorHandler });
