import { Request, Response } from 'express';
import Blog from '../../model/Blog';
const asyncHandler = require('express-async-handler');

export const blogs = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: userId } = res.locals.user;

  const { size } = req.query;

  const data = await Blog.findMany({
    match: { author: userId, isPublished: true },
    limit: Number(size),
    sort: { field: 'likeCount', order: -1 },
  });

  return res.status(200).json({
    ...data,
    message: 'Blogs Fetched Successfully',
  });
});
