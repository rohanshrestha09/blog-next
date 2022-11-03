import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import User from '../../../../model/User';
import init from '../../../../middleware/init';
import withValidateUser from '../../../../middleware/withValidateUser';
import { IUserReq, IUsers } from '../../../../interface/user';
import IMessage from '../../../../interface/message';
import { PipelineStage } from 'mongoose';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IUserReq,
  res: NextApiResponse<IUsers | IMessage>
) => {
  const {
    method,
    query: { pageSize, search },
    user: { following },
  } = req;

  switch (method) {
    case 'GET':
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

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withValidateUser(handler);
