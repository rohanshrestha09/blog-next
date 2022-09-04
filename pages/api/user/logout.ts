import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import { serialize } from 'cookie';
import init from '../../../middleware/init';
import withAuth from '../../../middleware/withAuth';
import IMessage from '../../../interface/message';

init();

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<IMessage>) => {
  const { method } = req;

  if (method === 'DELETE') {
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
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default withAuth(handler);
