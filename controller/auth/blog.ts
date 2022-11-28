import { Request, Response } from 'express';
import { PipelineStage } from 'mongoose';
import Blog from '../../model/Blog';
import User from '../../model/User';
const asyncHandler = require('express-async-handler');

export const blogs = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { blogs: blogIds } = res.locals.auth;

  const { sort, sortOrder, pageSize, genre, isPublished, search } = req.query;

  const query: PipelineStage[] = [
    { $match: { _id: { $in: blogIds } } },
    { $sort: { [String(sort || 'likesCount')]: sortOrder === 'asc' ? 1 : -1 } },
  ];

  if (sort === 'likesCount') query.push({ $sort: { createdAt: 1 } });

  if (genre) query.push({ $match: { genre: { $in: String(genre).split(',') } } });

  if (isPublished) query.push({ $match: { isPublished: isPublished === 'true' } });

  if (search)
    query.unshift({
      $search: {
        index: 'blog-search',
        autocomplete: { query: String(search), path: 'title' },
      },
    });

  try {
    const blogs = await Blog.aggregate([...query, { $limit: Number(pageSize || 20) }]);

    await User.populate(blogs, { path: 'author', select: 'fullname image' });

    const [{ totalCount } = { totalCount: 0 }] = await Blog.aggregate([
      ...query,
      { $count: 'totalCount' },
    ]);

    return res.status(200).json({
      data: blogs,
      count: totalCount,
      message: 'Blogs Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const bookmarks = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { bookmarks } = res.locals.auth;

  const { pageSize, genre, search } = req.query;

  const query: PipelineStage[] = [{ $match: { _id: { $in: bookmarks }, isPublished: true } }];

  if (genre) query.push({ $match: { genre: { $in: String(genre).split(',') } } });

  if (search)
    query.unshift({
      $search: {
        index: 'blog-search',
        autocomplete: { query: String(search), path: 'title' },
      },
    });

  try {
    const blogs = await Blog.aggregate([...query, { $limit: Number(pageSize || 20) }]);

    await User.populate(blogs, { path: 'author', select: 'fullname image' });

    const [{ totalCount } = { totalCount: 0 }] = await Blog.aggregate([
      ...query,
      { $count: 'totalCount' },
    ]);

    return res.status(200).json({
      data: blogs,
      count: totalCount,
      message: 'Blogs Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const followingBlogs = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { following } = res.locals.auth;

    const { pageSize } = req.query;

    let query = { author: following, isPublished: true };

    try {
      return res.status(200).json({
        data: await Blog.find(query)
          .limit(Number(pageSize || 20))
          .populate('author', 'fullname image'),
        count: await Blog.countDocuments(query),
        message: 'Following Blogs Fetched Successfully',
      });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);
