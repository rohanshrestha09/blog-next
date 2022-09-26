import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../interface/next';
import { Secret, JwtPayload, verify } from 'jsonwebtoken';
import { serialize } from 'cookie';
import User from '../model/User';
import { IAuth } from '../interface/user';
import IMessage from '../interface/message';

const bypassAuth = (url: string | undefined, method: string | undefined): boolean =>
  (url && url.startsWith('/api/blog') && method === 'GET') || false;

const withAuth = (handler: NextApiHandler) => {
  return async (req: NextApiRequest & IAuth, res: NextApiResponse<IMessage>) => {
    if (bypassAuth(req.url, req.method)) return handler(req, res);

    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: 'Not authorised' });

    try {
      const { _id } = verify(token, process.env.JWT_TOKEN as Secret) as JwtPayload;

      const auth = await User.findById(_id).select('-password');

      if (!auth) {
        const serialized = serialize('token', '', {
          maxAge: 0,
          path: '/',
        });

        res.setHeader('Set-Cookie', serialized);

        return res.status(404).json({ message: 'User does not exist' });
      }

      req.auth = auth;
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }

    return handler(req, res);
  };
};

export default withAuth;
