import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { Blog, prisma, User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { validateBlog } from 'middlewares/validateBlog';
import { errorHandler, HttpException } from 'utils/exception';
import { httpResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { auth: User; blog: Blog }, NextApiResponse>();

router.use(auth(), validateBlog(), async (req, _res, next) => {
  if (req.auth.id !== req.blog.authorId) throw new HttpException(401, 'Unauthorised');

  await next();
});

router.post(async (req, res) => {
  const blog = req.blog;

  await prisma.blog.update({ where: { id: blog.id }, data: { isPublished: true } });

  return res.status(201).json(httpResponse('Blog published'));
});

router.delete(async (req, res) => {
  const blog = req.blog;

  await prisma.blog.update({ where: { id: blog.id }, data: { isPublished: false } });

  return res.status(201).json(httpResponse('Blog unpublished'));
});

export default router.handler({ onError: errorHandler });
