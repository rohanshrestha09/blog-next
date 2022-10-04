import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import User from '../../../model/User';
import init from '../../../middleware/init';
import withAuth from '../../../middleware/withAuth';
import { IAuth, IFollowing } from '../../../interface/user';
import IMessage from '../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuth,
  res: NextApiResponse<IFollowing | IMessage>
) => {
  const {
    method,
    query: { pageSize, search },
    auth: { following },
  } = req;

  switch (method) {
    case 'GET':
      let query = { _id: following };

      if (search)
        query = Object.assign(
          {
            $text: { $search: typeof search === 'string' && search.toLowerCase() },
          },
          query
        );

      try {
        return res.status(200).json({
          message: 'Followers fetched successfully',
          following: await User.find(query)
            .select('-password')
            .limit(Number(pageSize || 20)),
        });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(handler);
