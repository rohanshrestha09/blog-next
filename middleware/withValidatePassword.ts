import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../interface/next';
import bcrypt from 'bcryptjs';
import User from '../model/User';
import { IAuthReq } from '../interface/user';
import IMessage from '../interface/message';

const bypassPasswordValidation = (url: string | undefined, method: string | undefined): boolean =>
  (url && url.startsWith('/api/auth') && method === 'GET') || false;

const withValidatePassword = (handler: NextApiHandler) => {
  return async (req: NextApiRequest & IAuthReq, res: NextApiResponse<IMessage>) => {
    if (bypassPasswordValidation(req.url, req.method)) return handler(req, res);

    const {
      auth: { _id: authId },
      body: { password },
    } = req;

    try {
      if (!password) return res.status(403).json({ message: 'Please input password' });

      const auth = await User.findById(authId).select('+password');

      const isMatched: boolean = await bcrypt.compare(password, auth.password);

      if (!isMatched) return res.status(403).json({ message: 'Incorrect Password' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }

    return handler(req, res);
  };
};

export default withValidatePassword;
