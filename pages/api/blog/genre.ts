import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { Genre } from 'lib/prisma';
import { errorHandler } from 'utils/exception';
import { getResponse } from 'utils/response';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (_req, res) => {
  return res.status(200).json(getResponse('Genre fetched', Genre));
});

export default router.handler({ onError: errorHandler });
