import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import User from '../../../model/User';
import init from '../../../middleware/init';
import withAuth from '../../../middleware/withAuth';
import deleteFile from '../../../middleware/deleteFile';
import { IAuthReq } from '../../../interface/user';
import IMessage from '../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuthReq,
  res: NextApiResponse<IMessage>
) => {
  const { method } = req;

  if (method === 'DELETE') {
    const { _id: authId, image, imageName } = req.auth;

    try {
      if (image && imageName) deleteFile(imageName);

      await User.findByIdAndUpdate(authId, {
        image: null,
        imageName: null,
      });

      return res.status(200).json({ message: 'Profile Image Removed Successfully' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default withAuth(handler);
