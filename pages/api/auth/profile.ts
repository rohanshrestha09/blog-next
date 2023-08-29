import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { errorHandler } from 'utils/exception';
import { getResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router
  .use(auth())
  .get((req, res) => res.status(200).json(getResponse('Profile fetched', req.auth)));

export default router.handler({ onError: errorHandler });
