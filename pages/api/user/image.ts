import nextConnect from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import User from '../../../model/User';
import middleware from '../../../middleware/middleware';
import auth from '../../../middleware/auth';
import IMessage from '../../../interface/message';
import { IUser } from '../../../interface/user';

const handler = nextConnect();

handler.use(middleware).use(auth);

handler.delete(async (req: NextApiRequest & IUser, res: NextApiResponse<IMessage>) => {
  const { _id: _userId, image, imageName } = req.user;

  const storage = getStorage();

  try {
    if (image) deleteObject(ref(storage, `users/${imageName}`));

    await User.findByIdAndUpdate(_userId, {
      $unset: { image: '', imageName: '' },
    });

    return res.status(200).json({ message: 'Profile Image Removed Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export default handler;
