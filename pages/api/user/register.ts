import { NextApiRequest, NextApiResponse } from 'next';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import moment from 'moment';
import nextConnect from 'next-connect';
import { isEmpty } from 'lodash';
import fs from 'fs';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import User from '../../../model/User';
import middleware from '../../../middleware/middleware';
import parseMultipartForm from '../../../middleware/parseMultipartForm';
import { IToken } from '../../../interface/user';
import IMessage from '../../../interface/message';

const fsPromises = fs.promises;

moment.suppressDeprecationWarnings = true;

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = nextConnect();

handler.use(middleware).use(parseMultipartForm);

handler.post(
  async (req: NextApiRequest & { files: any }, res: NextApiResponse<IToken | IMessage>) => {
    const { fullname, email, password, confirmPassword, dateOfBirth } = req.body;

    const storage = getStorage();

    try {
      const userExists = await User.findOne({ email });

      if (userExists)
        return res.status(403).json({ message: 'User already exists. Choose a different email.' });

      if (!password || password < 8)
        return res.status(403).json({ message: 'Password must contain atleast 8 characters.' });

      if (password !== confirmPassword)
        return res.status(403).json({ message: 'Password does not match.' });

      const salt = await bcrypt.genSalt(10);

      const encryptedPassword: string = await bcrypt.hash(password, salt);

      const { _id: _userId } = await User.create({
        fullname,
        email,
        password: encryptedPassword,
        dateOfBirth: new Date(moment(dateOfBirth).format()),
      });

      if (!isEmpty(req.files)) {
        const file = req.files.image;

        if (!file.mimetype.startsWith('image/'))
          return res.status(403).json({ message: 'Please choose an image' });

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

      const token: string = jwt.sign({ _id: _userId }, process.env.JWT_TOKEN as Secret, {
        expiresIn: '30d',
      });

      const serialized = serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      res.setHeader('Set-Cookie', serialized);

      return res.status(200).json({ token, message: 'Signup Successful' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);

export default handler;
