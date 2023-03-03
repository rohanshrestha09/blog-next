import { Request, Response } from 'express';
import Blog from '../../model/Blog';
const asyncHandler = require('express-async-handler');

export const blogs = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { blogs } = res.locals.auth;

  const { sort, order, size, genre, isPublished, search } = req.query;

  let query = { _id: { $in: blogs } };

  if (genre) query = Object.assign({ genre: { $in: String(genre).split(',') } }, query);

  if (isPublished) query = Object.assign({ isPublished: isPublished === 'true' }, query);

  try {
    const data = await Blog.findMany({
      match: query,
      search,
      limit: Number(size),
      sort: { field: String(sort || 'like'), order: order === 'asc' ? 1 : -1 },
    });

    return res.status(200).json({
      ...data,
      message: 'Blogs Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const bookmarks = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { bookmarks } = res.locals.auth;

  const { size, genre, search } = req.query;

  let query = { _id: { $in: bookmarks }, isPublished: true };

  if (genre) query = Object.assign({ genre: { $in: String(genre).split(',') } }, query);

  try {
    const data = await Blog.findMany({ match: query, search, limit: Number(size) });

    return res.status(200).json({
      ...data,
      message: 'Blogs Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const followingBlogs = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { followings } = res.locals.auth;

    const { size } = req.query;

    try {
      const data = await Blog.findMany({
        match: { author: { $in: followings }, isPublished: true },
        limit: Number(size),
        sort: { field: 'createdAt', order: -1 },
      });

      return res.status(200).json({
        ...data,
        message: 'Following Blogs Fetched Successfully',
      });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);
