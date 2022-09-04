import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import jwt, { Secret } from 'jsonwebtoken';
import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';
import init from '../../../middleware/init';
import User from '../../../model/User';
import IMessage from '../../../interface/message';
import { IToken } from '../../../interface/user';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<IToken | IMessage>
) => {
  const { method } = req;

  if (method === 'POST') {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select('+password');

      if (!user) return res.status(404).json({ message: 'User does not exist.' });

      const isMatched: boolean = await bcrypt.compare(password, user.password);

      if (!isMatched) return res.status(403).json({ message: 'Incorrect Password' });

      const token: string = jwt.sign({ _id: user._id }, process.env.JWT_TOKEN as Secret, {
        expiresIn: '30d',
      });

      const serialized = serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      res.setHeader('Set-Cookie', serialized);

      return res.status(200).json({ token, message: 'Login Successful' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default handler;
