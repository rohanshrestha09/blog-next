import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { exculdeFields, prisma, userFields } from 'lib/prisma';
import { validateUser } from 'middlewares/validateUser';
import { errorHandler } from 'utils/exception';
import { getAllResponse } from 'utils/response';
import { parseQuery } from 'utils/parseQuery';
import { getPages } from 'utils';
import { User } from 'interface/models';

const router = createRouter<NextApiRequest & { user: User }, NextApiResponse>();

router.use(validateUser()).get(async (req, res) => {
  const user = req.user;

  const { take, skip, search, sort, order } = await parseQuery(req.query);

  const count = await prisma.user.count({ where: { followedBy: { some: { id: user.id } } } });

  const following = await prisma.user
    .findUnique({
      where: {
        id: user.id,
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
