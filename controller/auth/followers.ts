import { Request, Response } from 'express';
import User from '../../model/User';
const asyncHandler = require('express-async-handler');

export const followers = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { followers } = res.locals.auth;

  const { size, search } = req.query;

  try {
    const data = await User.findMany({
      match: { _id: { $in: followers } },
      search,
      limit: Number(size),
      exclude: ['password', 'email'],
    });

    return res.status(200).json({
      ...data,
      message: 'Followers fetched successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const following = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { followings } = res.locals.auth;

  const { size, search } = req.query;

  try {
    const data = await User.findMany({
      match: { _id: { $in: followings } },
      search,
      limit: Number(size),
      exclude: ['password', 'email'],
    });

    return res.status(200).json({
      ...data,
      message: 'Following fetched successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
