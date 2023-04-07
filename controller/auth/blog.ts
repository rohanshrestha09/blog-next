import { Request, Response } from 'express';
import Blog from '../../model/Blog';
import BlogBookmark from '../../model/BlogBookmark';
import UserFollow from '../../model/UserFollow';
const asyncHandler = require('express-async-handler');

export const blogs = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: authId } = res.locals.auth;

  const { sort, order, size, genre, isPublished, search } = req.query;

  let query = { author: authId };

  if (genre) query = Object.assign({ genre: { $in: String(genre).split(',') } }, query);

  if (isPublished) query = Object.assign({ isPublished: isPublished === 'true' }, query);

  const data = await Blog.findMany({
    match: query,
    viewer: authId,
    search,
    limit: Number(size),
    sort: { field: String(sort || 'likeCount'), order: order === 'asc' ? 1 : -1 },
  });

  return res.status(200).json({
    ...data,
    message: 'Blogs Fetched Successfully',
  });
});

export const bookmarks = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: authId } = res.locals.auth;

  const { size, genre, search } = req.query;

  let query = { isPublished: true };

  if (genre) query = Object.assign({ genre: { $in: String(genre).split(',') } }, query);

  const bookmarks =
    (await BlogBookmark.find({ user: authId }))?.map(({ bookmarks }) => bookmarks) ?? [];

  query = Object.assign({ _id: { $in: bookmarks } }, query);

  // const data = await User.findBookmarks({
  //   match: query,
  //   user: authId,
  //   viewer: authId,
  //   search,
  //   limit: Number(size),
  // });

  const data = await Blog.findMany({ match: query, viewer: authId, search, limit: Number(size) });

  return res.status(200).json({
    ...data,
    message: 'Blogs Fetched Successfully',
  });
});

export const followingBlogs = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { _id: authId } = res.locals.auth;

    const { size } = req.query;

    const followers =
      (await UserFollow.find({ user: authId }))?.map(({ follows }) => follows) ?? [];

    const data = await Blog.findMany({
      match: { aithor: { $in: followers } },
      viewer: authId,
      limit: Number(size),
      sort: { field: 'createdAt', order: -1 },
    });

    // const data = await User.findFollowingBlogs({
    //   user: authId,
    //   viewer: authId,
    //   limit: Number(size),
    //   sort: { field: 'createdAt', order: -1 },
    // });

    return res.status(200).json({
      ...data,
      message: 'Following Blogs Fetched Successfully',
    });
  }
);
