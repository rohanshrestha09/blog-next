import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import middleware from '../../../../middleware/middleware';
import validateUser from '../../../../middleware/validateUser';
import IMessage from '../../../../interface/message';
import { IUser } from '../../../../interface/user';
import { IQueryUser } from '../../../../interface/user';

const handler = nextConnect();

handler.use(middleware).use(validateUser);

handler.get(async (req: NextApiRequest & IQueryUser, res: NextApiResponse<IUser | IMessage>) => {
  try {
    return res.status(200).json({
      user: req.queryUser,
      message: 'User Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export default handler;
