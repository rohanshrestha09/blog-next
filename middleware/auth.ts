import { NextApiRequest, NextApiResponse } from 'next';
import { NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../model/User';
import Blog from '../model/Blog';
import IMessage from '../interface/message';
import { IUser } from '../interface/user';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

const auth = async (
  req: NextApiRequest & IUser,
  res: NextApiResponse<IMessage>,
  next: NextFunction
): Promise<any> => {
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

    next();
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
};

export default auth;
