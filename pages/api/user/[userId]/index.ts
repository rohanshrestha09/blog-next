import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { User } from 'lib/prisma';
import { validateUser } from 'middlewares/validateUser';
import { errorHandler } from 'utils/exception';
import { getResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { user: User }, NextApiResponse>();

router.use(validateUser()).get(async (req, res) => {
  return res.status(200).json(getResponse('User fetched', req.user));
});

export default router.handler({ onError: errorHandler });
