import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { ResponseDto } from 'server/dtos/response';
import { genre } from 'server/enums/genre';
import { errorHandler } from 'server/exception';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get((_, res) => res.status(200).json(new ResponseDto('Genre fetched', genre)));

export default router.handler({ onError: errorHandler });
