import { Request, Response } from 'express';
import Blog from '../../model/Blog';
const asyncHandler = require('express-async-handler');

export const blog = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { blogs } = res.locals.user;

  const { pageSize } = req.query;

  let query = { _id: blogs, isPublished: true };

  try {
    return res.status(200).json({
      data: await Blog.find(query)
        .sort({ likesCount: -1 })
        .limit(Number(pageSize || 20))
        .populate('author', 'fullname image'),
      count: await Blog.countDocuments(query),
      message: 'Blogs Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
