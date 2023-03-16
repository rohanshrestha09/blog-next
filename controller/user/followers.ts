import { Request, Response } from 'express';
import User from '../../model/User';
const asyncHandler = require('express-async-handler');

export const followers = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: user } = res.locals.user;

  const { _id: viewer } = res.locals.viewer;

  const { search, size } = req.query;

  try {
    const data = await User.findFollowers(
      {
        user,
        viewer,
        search,
        limit: Number(size),
        exclude: ['password', 'email'],
      },
      'followers'
    );

    return res.status(200).json({
      ...data,
      message: 'Followers fetched successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const following = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: user } = res.locals.user;

  const { _id: viewer } = res.locals.viewer;

  const { search, size } = req.query;

  try {
    const data = await User.findFollowers(
      {
        user,
        viewer,
        search,
        limit: Number(size),
        exclude: ['password', 'email'],
      },
      'followings'
    );

    return res.status(200).json({
      ...data,
      message: 'Following fetched successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
