import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import auth from '../../../middleware/auth';
import { IUserInfo } from '../../../interface/user';
import middleware from '../../../middleware/middleware';

const handler = nextConnect();

handler.use(middleware).use(auth);

handler.get(async (req: NextApiRequest & IUserInfo, res: NextApiResponse) => {
  return res.status(200).json({ user: req.user });
});

export default handler;
