import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import bcrypt from 'bcryptjs';
import User from '../../../model/User';
import init from '../../../middleware/init';
import withAuth from '../../../middleware/withAuth';
import withValidatePassword from '../../../middleware/withValidatePassword';
import { IUser } from '../../../interface/user';
import IMessage from '../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IUser,
  res: NextApiResponse<IMessage>
) => {
  const { method } = req;

  if (method === 'POST') {
    const { _id: _userId } = req.user;

    const { newPassword, confirmNewPassword } = req.body;

    if (!newPassword || newPassword < 8)
      return res.status(403).json({ message: 'Password must contain atleast 8 characters.' });

    if (newPassword !== confirmNewPassword)
      return res.status(403).json({ message: 'Password does not match' });

    try {
      const salt = await bcrypt.genSalt(10);

      const encryptedPassword: string = await bcrypt.hash(newPassword, salt);

      await User.findByIdAndUpdate(_userId, { password: encryptedPassword });

      return res.status(200).json({ message: 'Password Change Successful' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default withAuth(withValidatePassword(handler));
