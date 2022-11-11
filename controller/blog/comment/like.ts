import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Comment from '../../../model/Comment';
const asyncHandler = require('express-async-handler');

export const likeComment = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: authId } = res.locals.auth;

  const { commentId } = req.query;

  try {
    const likeExist = await Comment.findOne({
      $and: [{ _id: commentId }, { likers: authId }],
    });

    if (likeExist) return res.status(403).json({ message: 'Already Liked' });

    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: 'Comment does not exist' });

    comment.likesCount += 1;

    comment.likers.push(authId);

    await comment.save();

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
        $and: [{ _id: commentId }, { likers: authId }],
      });

      if (!likeExist) return res.status(403).json({ message: 'ALready Unliked' });

      const comment = await Comment.findById(commentId);

      if (!comment) return res.status(404).json({ message: 'Comment does not exist' });

      comment.likesCount -= 1;

      comment.likers = comment.likers.filter(
        (likers: Types.ObjectId) => likers.toString() !== authId.toString()
      );

      await comment.save();

      return res.status(200).json({ message: 'Unliked' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);
