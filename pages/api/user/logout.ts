import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { serialize } from 'cookie';
import auth from '../../../middleware/auth';
import middleware from '../../../middleware/middleware';
import IMessage from '../../../interface/message';

const handler = nextConnect();

handler.use(middleware).use(auth);

handler.delete(async (req: NextApiRequest, res: NextApiResponse<IMessage>) => {
  try {
    const serialized = serialize('token', '', {
      maxAge: 0,
      path: '/',
    });

    res.setHeader('Set-Cookie', serialized);

    return res.status(200).json({ message: 'Logout Successful' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export default handler;
