import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../interface/next';
import mongoose from 'mongoose';
import User from '../model/User';
import Blog from '../model/Blog';
import { IQueryUser } from '../interface/user';
import IMessage from '../interface/message';

const withValidateUser = (handler: NextApiHandler) => {
  return async (req: NextApiRequest & IQueryUser, res: NextApiResponse<IMessage>) => {
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
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }

    return handler(req, res);
  };
};

export default withValidateUser;
