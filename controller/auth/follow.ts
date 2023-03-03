import { Request, Response } from 'express';
import User from '../../model/User';
import Notification from '../../model/Notification';
import { dispatchNotification } from '../../socket';
import { NOTIFICATION } from '../../server.interface';
const asyncHandler = require('express-async-handler');

const { FOLLOW_USER } = NOTIFICATION;

export const follow = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const {
    auth: { _id: authId, fullname },
    user: { _id: userId },
  } = res.locals;

  if (authId.toString() === userId.toString())
    return res.status(403).json({ message: "Can't follow same user" });

  try {
    const followingExists = await User.findOne({
      $and: [{ _id: authId }, { followings: userId }],
    });

    if (followingExists) return res.status(403).json({ message: 'Already Following' });

    await User.findByIdAndUpdate(authId, { $push: { followings: userId } });

    await User.findByIdAndUpdate(userId, { $push: { followers: authId } });

    const { _id: notificationId } = await Notification.create({
      type: FOLLOW_USER,
      user: authId,
      listener: [userId],
      description: `${fullname} followed you.`,
    });

    dispatchNotification({ listeners: [userId], notificationId });

    return res.status(200).json({ message: 'Follow Successful' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const unfollow = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const {
    auth: { _id: authId },
    user: { _id: userId },
  } = res.locals;

  if (authId.toString() === userId.toString())
    return res.status(403).json({ message: "Can't unfollow same user" });

  try {
    const followingExists = await User.findOne({
      $and: [{ _id: authId }, { followings: userId }],
    });

    if (!followingExists) return res.status(403).json({ message: 'Not following' });

    await User.findByIdAndUpdate(authId, { $pull: { followings: userId } });

    await User.findByIdAndUpdate(userId, { $pull: { followers: authId } });

    return res.status(200).json({ message: 'Unfollow Successful' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
