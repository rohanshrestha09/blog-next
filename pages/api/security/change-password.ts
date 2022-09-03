import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import bcrypt from 'bcryptjs';
import User from '../../../model/User';
import auth from '../../../middleware/auth';
import middleware from '../../../middleware/middleware';
import validatePassword from '../../../middleware/validatePassword';
import { IUser } from '../../../interface/user';
import IMessage from '../../../interface/message';

const handler = nextConnect();

handler.use(middleware).use(auth).use(validatePassword);

handler.post(async (req: NextApiRequest & IUser, res: NextApiResponse<IMessage>) => {
  const { newPassword, confirmNewPassword } = req.body;

  const { _id: _userId } = req.user;

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
});

export default handler;
