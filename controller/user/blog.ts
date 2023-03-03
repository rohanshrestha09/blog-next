import { Request, Response } from 'express';
import Blog from '../../model/Blog';
const asyncHandler = require('express-async-handler');

export const blog = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { blogs } = res.locals.user;

  const { size } = req.query;

  try {
    const data = await Blog.findMany({
      match: { _id: { $in: blogs }, isPublished: true },
      limit: Number(size),
      sort: { field: 'like', order: -1 },
    });

    return res.status(200).json({
      ...data,
      message: 'Blogs Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
