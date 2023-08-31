import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { exculdeFields, prisma, userFields, User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { errorHandler } from 'utils/exception';
import { parseQuery } from 'utils/parseQuery';
import { getAllResponse } from 'utils/response';
import { getPages } from 'utils';

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth()).get(async (req, res) => {
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
            search,
          },
        },
      },
    },
  });

  const following = await prisma.user
    .findUnique({
      where: {
        id: authUser.id,
      },
    })
    .following({
      where: {
        name: { search },
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