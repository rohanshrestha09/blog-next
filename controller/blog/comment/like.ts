import { Request, Response } from 'express';
import Comment from '../../../model/Comment';
import Notification from '../../../model/Notification';
import { dispatchNotification } from '../../../socket';
import { NOTIFICATION } from '../../../server.interface';
const asyncHandler = require('express-async-handler');

const { LIKE_COMMENT } = NOTIFICATION;

export const likeComment = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: authId, fullname } = res.locals.auth;

  const { commentId } = req.query;

  try {
    const likeExist = await Comment.findOne({
      $and: [{ _id: commentId }, { likes: authId }],
    });

    if (likeExist) return res.status(403).json({ message: 'Already Liked' });

    const comment = await Comment.findByIdAndUpdate(commentId, { $push: { likes: authId } });

    if (!comment) return res.status(404).json({ message: 'Comment does not exist' });

    const { _id: notificationId } = await Notification.create({
      type: LIKE_COMMENT,
      user: authId,
      listener: [comment.user],
      blog: comment.blog,
      comment: commentId,
      description: `${fullname} liked your comment.`,
    });

    dispatchNotification({ listeners: [comment.user.toString()], notificationId });

    return res.status(200).json({ message: 'Liked' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const unlikeComment = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { _id: authId } = res.locals.auth;

    const { commentId } = req.query;

    try {
      const likeExist = await Comment.findOne({
        $and: [{ _id: commentId }, { likes: authId }],
      });

      if (!likeExist) return res.status(403).json({ message: 'Already Unliked' });

      const comment = await Comment.findByIdAndUpdate(commentId, { $pull: { likes: authId } });

      if (!comment) return res.status(404).json({ message: 'Comment does not exist' });

      return res.status(200).json({ message: 'Unliked' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);
