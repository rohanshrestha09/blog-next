import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { blogFields, prisma } from 'lib/prisma';
import { validateUser } from 'middlewares/validateUser';
import { errorHandler } from 'utils/exception';
import { parseQuery } from 'utils/parseQuery';
import { getAllResponse } from 'utils/response';
import { getPages } from 'utils';
import { User } from 'interface/models';

const router = createRouter<NextApiRequest & { user: User }, NextApiResponse>();

router.use(validateUser()).get(async (req, res) => {
  const user = req.user;

  const { take, skip, search, sort, order } = await parseQuery(req.query);

  const count = await prisma.blog.count({ where: { authorId: user.id } });

  const blogs = await prisma.user
    .findUnique({
      where: {
        id: user.id,
      },
    })
    .blogs({
      where: {
        title: { search },
      },
      select: {
        ...blogFields,
        _count: {
          select: {
            likedBy: true,
            comments: true,
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
    .json(getAllResponse('Blogs fetched', { data: blogs, count, currentPage, totalPage }));
});

export default router.handler({ onError: errorHandler });
