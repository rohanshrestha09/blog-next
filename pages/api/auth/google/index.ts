import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { passport } from 'lib/passport';
import { errorHandler } from 'server/exception';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

export default router.handler({ onError: errorHandler });
