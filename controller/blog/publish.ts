import { Request, Response } from 'express';
import Blog from '../../model/Blog';
const asyncHandler = require('express-async-handler');

export const publish = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: blogId } = res.locals.blog;

  await Blog.findByIdAndUpdate(blogId, { isPublished: true });

  return res.status(201).json({ message: 'Blog Published Successfully' });
});

export const unpublish = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: blogId } = res.locals.blog;

  await Blog.findByIdAndUpdate(blogId, { isPublished: false });

  return res.status(201).json({ message: 'Blog Unpublished Successfully' });
});
