import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import User from '../../../../model/User';
import init from '../../../../middleware/init';
import withValidateUser from '../../../../middleware/withValidateUser';
import { IUserReq, IUsers } from '../../../../interface/user';
import IMessage from '../../../../interface/message';

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
      let query = { _id: following };

      if (search)
        query = Object.assign({ $text: { $search: String(search).toLowerCase() } }, query);

      try {
        return res.status(200).json({
          message: 'Following fetched successfully',
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
