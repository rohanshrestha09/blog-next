import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { passport } from 'lib/passport';
import { errorHandler } from 'utils/exception';

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .use(passport.authenticate('google', { failureRedirect: '/' }))
  .get((_, res) => res.redirect('/profile'));

export default router.handler({ onError: errorHandler });
