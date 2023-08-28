import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { validateUser } from 'middlewares/validateUser';
import { errorHandler } from 'utils/exception';
import { getResponse } from 'utils/response';
import { User } from 'interface/models';

const router = createRouter<NextApiRequest & { user: User }, NextApiResponse>();

router.use(validateUser()).get(async (req, res) => {
  return res.status(200).json(getResponse('User fetched', req.user));
});

export default router.handler({ onError: errorHandler });
