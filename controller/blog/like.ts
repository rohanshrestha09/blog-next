import { Request, Response } from 'express';
import Blog from '../../model/Blog';
import Notification from '../../model/Notification';
import User from '../../model/User';
import { dispatchNotification } from '../../socket';
import { NOTIFICATION } from '../../server.interface';
const asyncHandler = require('express-async-handler');

const { LIKE_BLOG } = NOTIFICATION;

export const likes = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { likes } = res.locals.blog;

  const { size } = req.query;

  try {
    const data = await User.findMany({
      match: { _id: { $in: likes } },
      limit: Number(size),
      exclude: ['password', 'email'],
    });

    return res.status(200).json({
      ...data,
      message: 'Likes fetched successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const like = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const {
    auth: { _id: authId, fullname },
    blog: { _id: blogId, author },
  } = res.locals;

  try {
    const likeExist = await Blog.findOne({
      $and: [{ _id: blogId }, { likes: authId }],
    });

    if (likeExist) return res.status(403).json({ message: 'Already Liked' });

    await Blog.findByIdAndUpdate(blogId, { $push: { likes: authId } });

    const { _id: notificationId } = await Notification.create({
      type: LIKE_BLOG,
      user: authId,
      listener: [author._id],
      blog: blogId,
      description: `${fullname} liked your blog.`,
    });

    dispatchNotification({ listeners: [author._id], notificationId });

    return res.status(200).json({ message: 'Liked' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const unlike = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const {
    auth: { _id: authId },
    blog: { _id: blogId },
  } = res.locals;

  try {
    const likeExist = await Blog.findOne({
      $and: [{ _id: blogId }, { likes: authId }],
    });

    if (!likeExist) return res.status(403).json({ message: 'Already Unliked' });

    await Blog.findByIdAndUpdate(blogId, { $pull: { likes: authId } });

    return res.status(200).json({ message: 'Unliked' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
