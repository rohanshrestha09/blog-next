import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import init from '../../../middleware/init';
import User from '../../../model/User';
import { IUsers } from '../../../interface/user';
import IMessage from '../../../interface/message';
import { PipelineStage } from 'mongoose';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<IUsers | IMessage>
) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      const { pageSize, search } = req.query;

      const query: PipelineStage[] = [{ $project: { password: 0, email: 0 } }];

      if (search)
        query.unshift({
          $search: {
            index: 'blog-user-search',
            autocomplete: { query: String(search), path: 'fullname' },
          },
        });

      const users = await User.aggregate([...query, { $sample: { size: Number(pageSize || 20) } }]);

      const [{ totalCount } = { totalCount: 0 }] = await User.aggregate([
        ...query,
        { $count: 'totalCount' },
      ]);

      try {
        return res.status(200).json({
          data: users,
          count: totalCount,
          message: 'Users Fetched Successfully',
        });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
