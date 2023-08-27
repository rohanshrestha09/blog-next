import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler } from 'utils/exception';

const router = createRouter<NextApiRequest, NextApiResponse>();

export default router.handler({ onError: errorHandler });
