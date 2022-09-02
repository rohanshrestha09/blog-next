import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import mongoose from 'mongoose';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../../../../model/User';
import middleware from '../../../../../middleware/middleware';
import validateUser from '../../../../../middleware/validateUser';
import { IQueryUser } from '../../../../../interface/user';
import IMessage from '../../../../../interface/message';

const handler = nextConnect();

handler.use(middleware).use(validateUser);

handler.post(async (req: NextApiRequest & IQueryUser, res: NextApiResponse<IMessage>) => {
  const { token } = req.query;

  const { _id: _userId } = req.queryUser;

  const { password } = req.body;

  if (!token) return res.status(403).json({ message: 'Invalid token' });

  if (!password || password < 8)
    return res.status(403).json({ message: 'Password must contain atleast 8 characters' });

  try {
    const { password: oldPassword } = await User.findById(_userId).select('+password');

    const { _id } = jwt.verify(
      token as string,
      `${process.env.JWT_PASSWORD}${oldPassword}`
    ) as JwtPayload;

    const salt = await bcrypt.genSalt(10);

    const encryptedPassword: string = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(new mongoose.Types.ObjectId(_id), {
      password: encryptedPassword,
    });

    return res.status(200).json({ message: 'Password Reset Successful' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export default handler;
