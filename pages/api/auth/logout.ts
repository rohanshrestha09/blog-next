import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { serialize } from 'cookie';
import { User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { errorHandler } from 'utils/exception';
import { httpResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth()).delete(async (_req, res) => {
  const serialized = serialize('token', '', {
    maxAge: -1,
    path: '/',
  });

  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  res.setHeader('Set-Cookie', serialized);

  return res.status(201).json(httpResponse('Logged out'));
});

export default router.handler({ onError: errorHandler });
