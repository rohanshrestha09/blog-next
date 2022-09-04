import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import init from '../../../../middleware/init';
import withValidateUser from '../../../../middleware/withValidateUser';
import IMessage from '../../../../interface/message';
import { IUser } from '../../../../interface/user';
import { IQueryUser } from '../../../../interface/user';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IQueryUser,
  res: NextApiResponse<IUser | IMessage>
) => {
  const { method } = req;

  if (method === 'GET') {
    try {
      return res.status(200).json({
        user: req.queryUser,
        message: 'User Fetched Successfully',
      });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default withValidateUser(handler);
