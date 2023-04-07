import { Request, Response } from 'express';
import Comment from '../../../model/Comment';
import Notification from '../../../model/Notification';
import CommentLike from '../../../model/CommentLike';
import { dispatchNotification } from '../../../socket';
import { NOTIFICATION } from '../../../server.interface';
const asyncHandler = require('express-async-handler');

const { POST_COMMENT } = NOTIFICATION;

export const comments = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: blogId } = res.locals.blog;

  const { _id: viewer } = res.locals.viewer;

  const { size } = req.query;

  const data = await Comment.findMany({ match: { blog: blogId }, viewer, limit: Number(size) });

  return res.status(200).json({
    ...data,
    message: 'Comments Fetched Successfully',
  });
});

export const comment = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const {
    auth: { _id: authId, fullname },
    blog: { _id: blogId, author },
  } = res.locals;

  const { comment } = req.body;

  const { _id: commentId } = await Comment.create({
    blog: blogId,
    user: authId,
    comment,
  });

  const { _id: notificationId } = await Notification.create({
    type: POST_COMMENT,
    user: authId,
    listener: [author._id],
    blog: blogId,
    comment: commentId,
    description: `${fullname} commented on your blog.`,
  });

  dispatchNotification({ listeners: [author._id], notificationId });

  return res.status(201).json({ message: 'Comment Successful' });
});

export const uncomment = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { commentId } = req.query;

  await Comment.findByIdAndDelete(commentId);

  await CommentLike.deleteMany({ likes: commentId });

  return res.status(201).json({ message: 'Comment Deleted Successfully' });
});
