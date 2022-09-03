import { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp } from 'firebase/app';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import mongoose from 'mongoose';
import formidable, { Fields, Files } from 'formidable';
import bcrypt from 'bcryptjs';
import Blog from '../model/Blog';
import User from '../model/User';
import IMiddleware from '../interface/middleware';
import IMessage from '../interface/message';
import { IUser } from '../interface/user';

const form = formidable({ multiples: true });

class Middleware {
  request;
  response;

  constructor(req: NextApiRequest & IMiddleware, res: NextApiResponse<IMessage>) {
    this.request = req;
    this.response = res;
  }

  init = async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);

    const firebaseConfig = {
      apiKey: process.env.API_KEY,
      authDomain: 'blog-sansar.firebaseapp.com',
      projectId: 'blog-sansar',
      storageBucket: 'blog-sansar.appspot.com',
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID,
    };

    // Initialize Firebase
    initializeApp(firebaseConfig);
  };

  auth = async (): Promise<any> => {
    const token = this.request.cookies.token;

    if (!token) return this.response.status(401).json({ message: 'Not authorised' });

    try {
      const { _id } = jwt.verify(token, process.env.JWT_TOKEN as Secret) as JwtPayload;

      const user = await User.findById(new mongoose.Types.ObjectId(_id)).select('-password');

      if (!user) return this.response.status(404).json({ message: 'User does not exist' });

      this.request.user = {
        ...user._doc,
        blogs: await Blog.find({ _id: user.blogs }),
        bookmarks: await Blog.find({ _id: user.bookmarks }),
      };
    } catch (err: Error | any) {
      return this.response.status(404).json({ message: err.message });
    }
  };

  parseMultipartForm = async () => {
    const contentType = this.request.headers['content-type'];
    if (contentType && contentType.indexOf('multipart/form-data') !== -1) {
      form.parse(this.request, (err, fields, files) => {
        if (!err) {
          this.request.body = fields;
          this.request.files = files;
        }
      });
    }
  };

  validateUser = async () => {
    const { _queryUserId } = this.request.query;

    try {
      const queryUser = await User.findById(
        new mongoose.Types.ObjectId(_queryUserId as string)
      ).select('-password');

      if (!queryUser) return this.response.status(404).json({ message: 'User does not exist' });

      this.request.queryUser = {
        ...queryUser._doc,
        blogs: await Blog.find({ _id: queryUser.blogs }),
        bookmarks: await Blog.find({ _id: queryUser.bookmarks }),
      };
    } catch (err: Error | any) {
      return this.response.status(404).json({ message: err.message });
    }
  };

  validatePassword = async (user: IUser['user'], bodyFields: any): Promise<any> => {
    const { _id: _userId } = user;

    const { password } = bodyFields;

    try {
      if (!password) return this.response.status(403).json({ message: 'Please input password' });

      const user = await User.findById(_userId).select('+password');

      const isMatched: boolean = await bcrypt.compare(password, user.password);

      if (!isMatched) return this.response.status(403).json({ message: 'Incorrect Password' });
    } catch (err: Error | any) {
      return this.response.status(404).json({ message: err.message });
    }
  };

  validateBlog = async () => {
    const { _blogId } = this.request.query;

    try {
      const blog = await Blog.findById(new mongoose.Types.ObjectId(_blogId as string));

      if (!blog) return this.response.status(404).json({ message: 'Blog does not exist' });

      this.request.blog = blog;
    } catch (err: Error | any) {
      return this.response.status(404).json({ message: err.message });
    }
  };
}

export default Middleware;
