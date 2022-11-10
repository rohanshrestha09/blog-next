import { Request, Response } from 'express';
import Blog from '../../../model/Blog';
import Comment from '../../../model/Comment';
const asyncHandler = require('express-async-handler');

export const comments = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { comments } = res.locals.blog;

  const { pageSize } = req.query;

  const dataComments = await Comment.find({ _id: comments })
    .limit(Number(pageSize || 20))
    .populate('user', 'fullname image');

  try {
    return res.status(200).json({
      data: dataComments,
      count: await Comment.countDocuments({ _id: comments }),
      commentsCount: dataComments.length,
      message: 'Comments Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const comment = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const {
    auth: { _id: authId },
    blog: { _id: blogId, commentsCount },
  } = res.locals;

  const { comment } = req.body;

  try {
    const { _id: commentId } = await Comment.create({
      blog: blogId,
      user: authId,
      comment,
    });

    await Blog.findByIdAndUpdate(blogId, {
      $push: { comments: commentId },
      commentsCount: commentsCount + 1,
    });

    return res.status(200).json({ message: 'Comment Successfull' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const uncomment = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: blogId, commentsCount } = res.locals.blog;

  const { commentId } = req.query;

  try {
    await Comment.findByIdAndDelete(commentId);

    await Blog.findByIdAndUpdate(blogId, {
      $pull: { comments: commentId },
      commentsCount: commentsCount - 1,
    });

    return res.status(200).json({ message: 'Comment Deleted Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
