import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../../interface/next';
import mongoose from 'mongoose';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../../../../model/User';
import init from '../../../../../middleware/init';
import withValidateUser from '../../../../../middleware/withValidateUser';
import { IUser } from '../../../../../interface/user';
import IMessage from '../../../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IUser,
  res: NextApiResponse<IMessage>
) => {
  const {
    method,
    query: { token },
  } = req;

  if (method === 'POST') {
    const { _id: userId } = req.user;

    const { password, confirmPassword } = req.body;

    if (!token) return res.status(403).json({ message: 'Invalid token' });

    if (!password || password < 8)
      return res.status(403).json({ message: 'Password must contain atleast 8 characters' });

    if (password !== confirmPassword)
      return res.status(403).json({ message: 'Password does not match' });

    try {
      const { password: oldPassword } = await User.findById(userId).select('+password');

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
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default withValidateUser(handler);
