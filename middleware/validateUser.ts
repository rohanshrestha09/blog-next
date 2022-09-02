import { NextApiRequest, NextApiResponse } from 'next';
import { NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../model/User';
import Blog from '../model/Blog';
import { IUser } from '../interface/user';
import IMessage from '../interface/message';

const validateUser = async (
  req: NextApiRequest & { queryUser: IUser },
  res: NextApiResponse<IMessage>,
  next: NextFunction
): Promise<any> => {
  const { _queryUserId } = req.query;

  try {
    const queryUser = await User.findById(
      new mongoose.Types.ObjectId(_queryUserId as string)
    ).select('-password');

    if (!queryUser) return res.status(404).json({ message: 'User does not exist' });

    req.queryUser = {
      ...queryUser._doc,
      blogs: await Blog.find({ _id: queryUser.blogs }),
      bookmarks: await Blog.find({ _id: queryUser.bookmarks }),
    };

    next();
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
};

export default validateUser;
