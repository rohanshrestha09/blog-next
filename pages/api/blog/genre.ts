import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import IMessage from '../../../interface/message';
import middleware from '../../../middleware/middleware';
import { genre } from '../../../model/Blog';

const handler = nextConnect();

handler.use(middleware);

handler.get(async (req: NextApiRequest, res: NextApiResponse<{ genre: string[] } & IMessage>) => {
  return res.status(200).json({ genre, message: 'Genre Fetched Successfully' });
});

export default handler;
