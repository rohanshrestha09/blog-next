import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import auth from '../../../middleware/auth';
import { IUser } from '../../../interface/user';
import middleware from '../../../middleware/middleware';

const handler = nextConnect();

handler.use(middleware).use(auth);

handler.get(async (req: NextApiRequest & IUser, res: NextApiResponse<IUser>) => {
  return res.status(200).json({ user: req.user, message: 'Authentication Success' });
});

export default handler;
