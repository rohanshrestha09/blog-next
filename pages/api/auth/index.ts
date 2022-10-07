import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import { isEmpty } from 'lodash';
import moment from 'moment';
import init from '../../../middleware/init';
import withAuth from '../../../middleware/withAuth';
import User from '../../../model/User';
import withParseMultipartForm from '../../../middleware/withParseMultipartForm';
import withValidatePassword from '../../../middleware/withValidatePassword';
import uploadFile from '../../../middleware/uploadFile';
import deleteFile from '../../../middleware/deleteFile';
import { IAuth } from '../../../interface/user';
import IFiles from '../../../interface/files';
import IMessage from '../../../interface/message';

moment.suppressDeprecationWarnings = true;

export const config = {
  api: {
    bodyParser: false,
  },
};

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuth & IFiles,
  res: NextApiResponse<IAuth | IMessage>
) => {
  const {
    method,
    auth: { _id: authId, image, imageName },
  } = req;

  switch (method) {
    case 'GET':
      return res.status(200).json({ auth: req.auth, message: 'Authentication Success' });

    case 'PUT':
      const { fullname, bio, website, dateOfBirth } = req.body;

      try {
        if (!isEmpty(req.files)) {
          const file = req.files.image as any;

          if (!file.mimetype.startsWith('image/'))
            return res.status(403).json({ message: 'Please choose an image' });

          if (image && imageName) deleteFile(`users/${imageName}`);

          const filename = file.mimetype.replace('image/', `${authId}.`);

          const fileUrl = await uploadFile(file, `users/${filename}`);

          await User.findByIdAndUpdate(authId, {
            image: fileUrl,
            imageName: filename,
          });
        }

        await User.findByIdAndUpdate(authId, {
          fullname,
          bio,
          website,
          dateOfBirth: new Date(moment(dateOfBirth).format()),
        });

        return res.status(200).json({ message: 'Profile Updated Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      try {
        if (image && imageName) deleteFile(`users/${imageName}`);

        await User.findByIdAndDelete(authId);

        return res.status(200).json({ message: 'Profile Deleted Successfully' });
      } catch (err: any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};
export default withAuth(withParseMultipartForm(withValidatePassword(handler)));
