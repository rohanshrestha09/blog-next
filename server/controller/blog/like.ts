import { Request, Response } from 'express';
import Blog from '../../model/Blog';
import User from '../../model/User';
const asyncHandler = require('express-async-handler');

export const likes = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { likers } = res.locals.blog;

  const { pageSize } = req.query;

  try {
    return res.status(200).json({
      data: await User.find({ _id: likers })
        .select('-password -email')
        .limit(Number(pageSize || 20)),
      count: await User.countDocuments({ _id: likers }),
      message: 'Likers fetched successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const like = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const {
    auth: { _id: authId },
    blog: { _id: blogId, likesCount },
  } = res.locals;

  try {
    const likeExist = await Blog.findOne({
      $and: [{ _id: blogId }, { likers: authId }],
    });

    if (likeExist) return res.status(403).json({ message: 'Already Liked' });

    await Blog.findByIdAndUpdate(blogId, {
      $push: { likers: authId },
      likesCount: likesCount + 1,
    });

    await User.findByIdAndUpdate(authId, {
      $push: { liked: blogId },
    });

    return res.status(200).json({ message: 'Liked' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const unlike = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const {
    auth: { _id: authId },
    blog: { _id: blogId, likesCount },
  } = res.locals;

  try {
    const likeExist = await Blog.findOne({
      $and: [{ _id: blogId }, { likers: authId }],
    });

    if (!likeExist) return res.status(403).json({ message: 'ALready Unliked' });

    await Blog.findByIdAndUpdate(blogId, {
      $pull: { likers: authId },
      likesCount: likesCount - 1,
    });

    await User.findByIdAndUpdate(authId, {
      $pull: { liked: blogId },
    });

    return res.status(200).json({ message: 'Unliked' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
