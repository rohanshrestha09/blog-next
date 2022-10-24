import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import User from '../../../../model/User';
import init from '../../../../middleware/init';
import { IUserReq, IUsers } from '../../../../interface/user';
import IMessage from '../../../../interface/message';
import withValidateUser from '../../../../middleware/withValidateUser';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IUserReq,
  res: NextApiResponse<IUsers | IMessage>
) => {
  const {
    method,
    query: { pageSize, search },
    user: { followers },
  } = req;

  switch (method) {
    case 'GET':
      let query = { _id: followers };

      if (search)
        query = Object.assign({ $text: { $search: String(search).toLowerCase() } }, query);

      try {
        return res.status(200).json({
          message: 'Followers fetched successfully',
          data: await User.find(query)
            .select('-password -email')
            .limit(Number(pageSize || 20)),
          count: await User.countDocuments(query),
        });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withValidateUser(handler);
