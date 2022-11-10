import { Request, Response } from 'express';
import User from '../../model/User';
const asyncHandler = require('express-async-handler');

export const bookmark = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const {
    auth: { _id: authId },
    blog: { _id: blogId },
  } = res.locals;

  try {
    const bookmarkExist = await User.findOne({
      $and: [{ _id: authId }, { bookmarks: blogId }],
    });

    if (bookmarkExist) return res.status(403).json({ message: 'Already Bookmarked' });

    await User.findByIdAndUpdate(authId, { $push: { bookmarks: blogId } });

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
    const bookmarkExist = await User.findOne({
      $and: [{ _id: authId }, { bookmarks: blogId }],
    });

    if (!bookmarkExist) return res.status(403).json({ message: 'Already Unbookmarked' });

    await User.findByIdAndUpdate(authId, { $pull: { bookmarks: blogId } });

    return res.status(200).json({ message: 'Unbookmarked Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
