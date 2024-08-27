import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { serialize } from 'cookie';
import { passport } from 'lib/passport';
import { errorHandler } from 'server/exception';

const router = createRouter<NextApiRequest & { user: { token: string } }, NextApiResponse>();

router.get(
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  async (req, res) => {
    const serialized = serialize('token', req.user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    res.setHeader('Set-Cookie', serialized);

    res.redirect('/');
  },
);

export default router.handler({ onError: errorHandler });
