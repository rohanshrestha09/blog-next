import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { Blog, blogFields, exculdeFields, prisma, userFields } from 'lib/prisma';
import { HttpException } from 'utils/exception';

export const validateBlog = () => {
  return async (req: NextApiRequest & { blog: Blog }, _res: NextApiResponse, next: NextHandler) => {
    const { blogId } = req.query;

    if (Array.isArray(blogId)) throw new HttpException(400, 'Invalid operation');

    const blog = await prisma.blog.findUniqueOrThrow({
      where: { id: Number(blogId) },
      select: {
        ...blogFields,
        author: {
          select: exculdeFields(userFields, ['password', 'email']),
        },
        _count: {
          select: {
            likedBy: true,
            comments: true,
          },
        },
      },
    });

    req.blog = blog;

    await next();
  };
};
