import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import init from '../../../middleware/init';
import User from '../../../model/User';
import { IUsers } from '../../../interface/user';
import IMessage from '../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<IUsers | IMessage>
) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      const { pageSize } = req.query;

      try {
        return res.status(200).json({
          data: await User.aggregate([
            { $sample: { size: Number(pageSize || 4) } },
            { $project: { password: 0, email: 0 } },
          ]),
          count: await User.countDocuments({}),
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
