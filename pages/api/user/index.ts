import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { isEmpty } from 'lodash';
import moment from 'moment';
import fs from 'fs';
import withAuth from '../../../middleware/withAuth';
import User from '../../../model/User';
import init from '../../../middleware/init';
import withParseMultipartForm from '../../../middleware/withParseMultipartForm';
import withValidatePassword from '../../../middleware/withValidatePassword';
import IMessage from '../../../interface/message';
import IFiles from '../../../interface/files';
import { IUser } from '../../../interface/user';

moment.suppressDeprecationWarnings = true;

export const config = {
  api: {
    bodyParser: false,
  },
};

const fsPromises = fs.promises;

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IUser & IFiles,
  res: NextApiResponse<IMessage>
) => {
  const {
    method,
    user: { _id: _userId, image, imageName },
  } = req;

  const storage = getStorage();

  switch (method) {
    case 'PUT':
      const { fullname, bio, dateOfBirth } = req.body;

      try {
        if (!isEmpty(req.files)) {
          const file = req.files.image as any;

          if (!file.mimetype.startsWith('image/'))
            return res.status(403).json({ message: 'Please choose an image' });

          if (image) deleteObject(ref(storage, `users/${imageName}`));

          const filename = file.mimetype.replace('image/', `${_userId}.`);

          const storageRef = ref(storage, `users/${filename}`);

          const metadata = {
            contentType: file.mimetype,
          };

          await uploadBytes(storageRef, await fsPromises.readFile(file.filepath), metadata);

          const url = await getDownloadURL(storageRef);

          await User.findByIdAndUpdate(_userId, {
            image: url,
            imageName: filename,
          });
        }

        await User.findByIdAndUpdate(_userId, {
          fullname,
          bio,
          dateOfBirth: new Date(moment(dateOfBirth).format()),
        });

        return res.status(200).json({ message: 'Profile Updated Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      try {
        if (image) deleteObject(ref(storage, `users/${imageName}`));

        await User.findByIdAndDelete(_userId);

        return res.status(200).json({ message: 'Profile Deleted Successfully' });
      } catch (err: any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(withParseMultipartForm(withValidatePassword(handler)));

/* handler.use(middleware).use(auth).use(parseMultipartForm).use(validatePassword);

handler.put(
  async (req: NextApiRequest & IUser & { files: any }, res: NextApiResponse<IMessage>) => {
    const { fullname, bio, dateOfBirth } = req.body;

    const { _id: _userId, image, imageName } = req.user;

    const storage = getStorage();

    try {
      if (!isEmpty(req.files)) {
        const file = req.files.image as any;

        if (!file.mimetype.startsWith('image/'))
          return res.status(403).json({ message: 'Please choose an image' });

        if (image) deleteObject(ref(storage, `users/${imageName}`));

        const filename = file.mimetype.replace('image/', `${_userId}.`);

        const storageRef = ref(storage, `users/${filename}`);

        const metadata = {
          contentType: file.mimetype,
        };

        await uploadBytes(storageRef, await fsPromises.readFile(file.filepath), metadata);

        const url = await getDownloadURL(storageRef);

        await User.findByIdAndUpdate(_userId, {
          image: url,
          imageName: filename,
        });
      }

      await User.findByIdAndUpdate(_userId, {
        fullname,
        bio,
        dateOfBirth: new Date(moment(dateOfBirth).format()),
      });

      return res.status(200).json({ message: 'Profile Updated Successfully' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);

handler.delete(async (req: NextApiRequest & IUser, res: NextApiResponse<IMessage>) => {
  const { _id: _userId, image, imageName } = req.user;

  const storage = getStorage();

  try {
    if (image) deleteObject(ref(storage, `users/${imageName}`));

    await User.findByIdAndDelete(_userId);

    return res.status(200).json({ message: 'Profile Deleted Successfully' });
  } catch (err: any) {
    return res.status(404).json({ message: err.message });
  }
});

export default handler;*/
