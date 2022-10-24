import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../interface/next';
import User from '../model/User';
import IMessage from '../interface/message';
import { IUserReq } from '../interface/user';

const withValidateUser = (handler: NextApiHandler) => {
  return async (req: NextApiRequest & IUserReq, res: NextApiResponse<IMessage>) => {
    const { user: userId } = req.query;

    try {
      const user = await User.findById(userId).select('-password -email');

      if (!user) return res.status(404).json({ message: 'User does not exist' });

      req.user = user;
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }

    return handler(req, res);
  };
};

export default withValidateUser;
