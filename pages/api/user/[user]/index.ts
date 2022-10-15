import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import init from '../../../../middleware/init';
import withValidateUser from '../../../../middleware/withValidateUser';
import IMessage from '../../../../interface/message';
import { IUserReq, IUser } from '../../../../interface/user';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IUserReq,
  res: NextApiResponse<IUser | IMessage>
) => {
  const { method } = req;

  return method === 'GET'
    ? res.status(200).json({
        data: req.user,
        message: 'User Fetched Successfully',
      })
    : res.status(405).json({ message: 'Method not allowed' });
};

export default withValidateUser(handler);
