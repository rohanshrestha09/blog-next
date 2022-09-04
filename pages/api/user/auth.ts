import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import init from '../../../middleware/init';
import withAuth from '../../../middleware/withAuth';
import IMessage from '../../../interface/message';
import { IUser } from '../../../interface/user';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IUser,
  res: NextApiResponse<IUser | IMessage>
) => {
  const { method } = req;

  return method === 'GET'
    ? res.status(200).json({ user: req.user, message: 'Authentication Success' })
    : res.status(405).json({ message: 'Method not allowed' });
};

export default withAuth(handler);
