import { NextApiRequest, NextApiResponse } from 'next';
import { useRouter } from 'next/router';
import { NextFunction } from 'express';
import mongoose from 'mongoose';
import Blog from '../model/Blog';
import { IBlog } from '../interface/blog';
import IMessage from '../interface/message';

const blogValidator = async (
  req: NextApiRequest & IBlog,
  res: NextApiResponse<IMessage>,
  next: NextFunction
) => {
  const router = useRouter();

  const { _blogId } = router.query;

  try {
    const blog = await Blog.findById(new mongoose.Types.ObjectId(_blogId as string));

    if (!blog) return res.status(404).json({ message: 'Blog does not exist' });

    req.blog = blog;

    next();
  } catch (err: any) {
    return res.status(404).json({ message: err.message });
  }
};

export default blogValidator;
