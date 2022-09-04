import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import User from '../../../model/User';
import init from '../../../middleware/init';
import withAuth from '../../../middleware/withAuth';
import { IUser } from '../../../interface/user';
import IMessage from '../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IUser,
  res: NextApiResponse<IMessage>
) => {
  const { method } = req;

  if (method === 'DELETE') {
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
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default withAuth(handler);
