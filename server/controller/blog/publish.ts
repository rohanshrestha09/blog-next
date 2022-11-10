import { Request, Response } from 'express';
import Blog from '../../model/Blog';
const asyncHandler = require('express-async-handler');

export const publish = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: blogId } = res.locals.blog;

  try {
    await Blog.findByIdAndUpdate(blogId, { isPublished: true });

    return res.status(200).json({ message: 'Blog Published Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const unpublish = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: blogId } = res.locals.blog;

  try {
    await Blog.findByIdAndUpdate(blogId, { isPublished: false });

    return res.status(200).json({ message: 'Blog Unpublished Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
