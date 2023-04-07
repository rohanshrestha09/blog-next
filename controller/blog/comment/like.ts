import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Notification from '../../../model/Notification';
import CommentLike from '../../../model/CommentLike';
import { dispatchNotification } from '../../../socket';
import { ICommentSchema, NOTIFICATION } from '../../../server.interface';
const asyncHandler = require('express-async-handler');

const { LIKE_COMMENT } = NOTIFICATION;

export const likeComment = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: authId, fullname } = res.locals.auth;

  const { commentId } = req.query;

  const likeExist = await CommentLike.findOne({
    $and: [{ user: authId }, { likes: commentId }],
  });

  if (likeExist) return res.status(403).json({ message: 'Already Liked' });

  const comment = (await (
    await CommentLike.create({ user: authId, likes: commentId })
  ).populate('likes')) as ICommentSchema & {
    likes: { user: Types.ObjectId; blog: Types.ObjectId };
  };

  if (!comment) return res.status(404).json({ message: 'Comment does not exist' });

  const notificationExists = await Notification.findOne({
    type: LIKE_COMMENT,
    user: authId,
    listener: [comment.likes.user],
    blog: comment.likes.blog,
    comment: commentId,
  });

  if (!notificationExists) {
    const { _id: notificationId } = await Notification.create({
      type: LIKE_COMMENT,
      user: authId,
      listener: [comment.likes.user],
      blog: comment.likes.blog,
      comment: commentId,
      description: `${fullname} liked your comment.`,
    });

    dispatchNotification({ listeners: [comment.likes.user.toString()], notificationId });
  }

  return res.status(201).json({ message: 'Liked' });
});

export const unlikeComment = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { _id: authId } = res.locals.auth;

    const { commentId } = req.query;

    const likeExist = await CommentLike.findOne({
      $and: [{ user: authId }, { likes: commentId }],
    });

    if (!likeExist) return res.status(403).json({ message: 'Already Unliked' });

    await CommentLike.deleteOne({
      $and: [{ user: authId }, { likes: commentId }],
    });

    return res.status(201).json({ message: 'Unliked' });
  }
);
