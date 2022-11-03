import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import { PipelineStage } from 'mongoose';
import User from '../../../model/User';
import init from '../../../middleware/init';
import withAuth from '../../../middleware/withAuth';
import { IAuthReq, IUsers } from '../../../interface/user';
import IMessage from '../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuthReq,
  res: NextApiResponse<IUsers | IMessage>
) => {
  const {
    method,
    query: { pageSize, search },
    auth: { followers },
  } = req;

  switch (method) {
    case 'GET':
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
          data: users,
          count: totalCount,
          message: 'Followers fetched successfully',
        });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(handler);
