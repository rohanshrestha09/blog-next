import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../interface/next';
import mongoose from 'mongoose';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import User from '../model/User';
import Blog from '../model/Blog';
import { IUser } from '../interface/user';
import IMessage from '../interface/message';

const bypassAuth = (url: string | undefined, method: string | undefined): boolean => {
  if (url && url.startsWith('/api/blog') && method === 'GET') return true;
  return false;
};

const withAuth = (handler: NextApiHandler) => {
  return async (req: NextApiRequest & IUser, res: NextApiResponse<IMessage>) => {
    if (bypassAuth(req.url, req.method)) return handler(req, res);

    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: 'Not authorised' });

    try {
      const { _id } = jwt.verify(token, process.env.JWT_TOKEN as Secret) as JwtPayload;

      const user = await User.findById(new mongoose.Types.ObjectId(_id)).select('-password');

      if (!user) return res.status(404).json({ message: 'User does not exist' });

      req.user = {
        ...user._doc,
        blogs: await Blog.find({ _id: user.blogs }),
        bookmarks: await Blog.find({ _id: user.bookmarks }),
      };
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }

    return handler(req, res);
  };
};

export default withAuth;
