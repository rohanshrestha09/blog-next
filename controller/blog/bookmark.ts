import { Request, Response } from 'express';
import BlogBookmark from '../../model/BlogBookmark';
const asyncHandler = require('express-async-handler');

export const bookmark = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const {
    auth: { _id: authId },
    blog: { _id: blogId },
  } = res.locals;

  try {
    const bookmarkExist = await BlogBookmark.findOne({
      $and: [{ user: authId }, { bookmarks: blogId }],
    });

    if (bookmarkExist) return res.status(403).json({ message: 'Already Bookmarked' });

    await BlogBookmark.create({ user: authId, bookmarks: blogId });

    return res.status(200).json({ message: 'Bookmarked Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const unbookmark = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const {
    auth: { _id: authId },
    blog: { _id: blogId },
  } = res.locals;

  try {
    const bookmarkExist = await BlogBookmark.findOne({
      $and: [{ user: authId }, { bookmarks: blogId }],
    });

    if (!bookmarkExist) return res.status(403).json({ message: 'Already Unbookmarked' });

    await BlogBookmark.deleteOne({ $and: [{ user: authId, bookmarks: blogId }] });

    return res.status(200).json({ message: 'Unbookmarked Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
