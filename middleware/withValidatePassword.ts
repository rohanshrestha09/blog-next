import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../interface/next';
import bcrypt from 'bcryptjs';
import User from '../model/User';
import { IUser } from '../interface/user';
import IMessage from '../interface/message';

const withValidatePassword = (handler: NextApiHandler) => {
  return async (req: NextApiRequest & IUser, res: NextApiResponse<IMessage>) => {
    const {
      user: { _id: _userId },
      body: { password },
    } = req;

    try {
      if (!password) return res.status(403).json({ message: 'Please input password' });

      const user = await User.findById(_userId).select('+password');

      const isMatched: boolean = await bcrypt.compare(password, user.password);

      if (!isMatched) return res.status(403).json({ message: 'Incorrect Password' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }

    return handler(req, res);
  };
};

export default withValidatePassword;
