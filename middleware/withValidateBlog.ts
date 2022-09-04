import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../interface/next';
import mongoose from 'mongoose';
import Blog from '../model/Blog';
import { IBlog } from '../interface/blog';
import IMessage from '../interface/message';

const withValidateBlog = (handler: NextApiHandler) => {
  return async (req: NextApiRequest & IBlog, res: NextApiResponse<IMessage>) => {
    const { _blogId } = req.query;

    try {
      const blog = await Blog.findById(new mongoose.Types.ObjectId(_blogId as string));

      if (!blog) return res.status(404).json({ message: 'Blog does not exist' });

      req.blog = blog;
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
    return handler(req, res);
  };
};

export default withValidateBlog;
