import { NextApiRequest, NextApiResponse } from 'next';
import { NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../model/User';
import IMessage from '../interface/message';
import { IUser } from '../interface/user';

const validatePassword = async (
  req: NextApiRequest & IUser,
  res: NextApiResponse<IMessage>,
  next: NextFunction
) => {
  const { _id: _userId } = req.user;

  const { password } = req.body;

  try {
    if (!password) return res.status(403).json({ message: 'Please input password' });

    const user = await User.findById(_userId).select('+password');

    const isMatched: boolean = await bcrypt.compare(password, user.password);

    if (!isMatched) return res.status(403).json({ message: 'Incorrect Password' });

    next();
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
};

export default validatePassword;
