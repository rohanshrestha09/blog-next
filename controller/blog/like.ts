import { Request, Response } from 'express';
import Notification from '../../model/Notification';
import User from '../../model/User';
import { dispatchNotification } from '../../socket';
import { NOTIFICATION } from '../../server.interface';
import BlogLike from '../../model/BlogLike';
const asyncHandler = require('express-async-handler');

const { LIKE_BLOG } = NOTIFICATION;

export const likes = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: blogId } = res.locals.blog;

  const { _id: viewer } = res.locals.viewer;

  const { size } = req.query;

  try {
    const likes = (await BlogLike.find({ likes: blogId }))?.map(({ user }) => user) ?? [];

    // const data = await Blog.findLikes({
    //   blog: blogId,
    //   viewer,
    //   limit: Number(size),
    //   exclude: ['password', 'email'],
    // });

    const data = await User.findMany({
      match: { _id: { $in: likes } },
      viewer,
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
    const likeExist = await BlogLike.findOne({
      $and: [{ user: authId }, { likes: blogId }],
    });

    if (likeExist) return res.status(403).json({ message: 'Already Liked' });

    await BlogLike.create({ user: authId, likes: blogId });

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
    const likeExist = await BlogLike.findOne({
      $and: [{ user: authId }, { likes: blogId }],
    });

    if (!likeExist) return res.status(403).json({ message: 'Already Unliked' });

    await BlogLike.deleteOne({ $and: [{ user: authId }, { likes: blogId }] });

    return res.status(200).json({ message: 'Unliked' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
