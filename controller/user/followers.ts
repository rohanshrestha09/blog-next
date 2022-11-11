import { Request, Response } from 'express';
import { PipelineStage } from 'mongoose';
import User from '../../model/User';
const asyncHandler = require('express-async-handler');

export const followers = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { followers } = res.locals.user;

  const { search, pageSize } = req.query;

  const query: PipelineStage[] = [
    { $match: { _id: { $in: followers } } },
    { $project: { password: 0, email: 0 } },
  ];

  if (search)
    query.unshift({
      $search: {
        index: 'blog-user-search',
        autocomplete: { query: String(search), path: 'fullname' },
      },
    });

  const users = await User.aggregate([...query, { $limit: Number(pageSize || 20) }]);

  const [{ totalCount } = { totalCount: 0 }] = await User.aggregate([
    ...query,
    { $count: 'totalCount' },
  ]);

  try {
    return res.status(200).json({
      message: 'Followers fetched successfully',
      data: users,
      count: totalCount,
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const following = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { following } = res.locals.user;

  const { search, pageSize } = req.query;

  const query: PipelineStage[] = [
    { $match: { _id: { $in: following } } },
    { $project: { password: 0, email: 0 } },
  ];

  if (search)
    query.unshift({
      $search: {
        index: 'blog-user-search',
        autocomplete: { query: String(search), path: 'fullname' },
      },
    });

  const users = await User.aggregate([...query, { $limit: Number(pageSize || 20) }]);

  const [{ totalCount } = { totalCount: 0 }] = await User.aggregate([
    ...query,
    { $count: 'totalCount' },
  ]);

  try {
    return res.status(200).json({
      message: 'Following fetched successfully',
      data: users,
      count: totalCount,
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
