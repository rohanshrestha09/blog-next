import { Request, Response } from 'express';
import User from '../../model/User';
import UserFollow from '../../model/UserFollow';
const asyncHandler = require('express-async-handler');

export const followers = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: userId } = res.locals.user;

  const { _id: viewer } = res.locals.viewer;

  const { search, size } = req.query;

  try {
    const followers = (await UserFollow.find({ follows: userId }))?.map(({ user }) => user) || [];

    // const data = await User.findFollowers(
    //   {
    //     user,
    //     viewer,
    //     search,
    //     limit: Number(size),
    //     exclude: ['password', 'email'],
    //   },
    //   'followers'
    // );

    const data = await User.findMany({
      match: { _id: { $in: followers } },
      viewer,
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
  const { _id: userId } = res.locals.user;

  const { _id: viewer } = res.locals.viewer;

  const { search, size } = req.query;

  try {
    const following =
      (await UserFollow.find({ user: userId }))?.map(({ follows }) => follows) || [];

    // const data = await User.findFollowers(
    //   {
    //     user,
    //     viewer,
    //     search,
    //     limit: Number(size),
    //     exclude: ['password', 'email'],
    //   },
    //   'following'
    // );

    const data = await User.findMany({
      match: { _id: { $in: following } },
      viewer,
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
