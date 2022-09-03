import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { isEmpty } from 'lodash';
import fs from 'fs';
import User from '../../../model/User';
import Blog from '../../../model/Blog';
import middleware from '../../../middleware/middleware';
import auth from '../../../middleware/auth';
import parseMultipartForm from '../../../middleware/parseMultipartForm';
import { IUser } from '../../../interface/user';
import IMessage from '../../../interface/message';
import { IBlog } from '../../../interface/blog';

export const config = {
  api: {
    bodyParser: false,
  },
};

const fsPromises = fs.promises;

const handler = nextConnect();

handler.use(middleware);

handler.get(
  async (
    req: NextApiRequest,
    res: NextApiResponse<({ blogs: IBlog['blog'][] } & IMessage) | IMessage>
  ) => {
    const { sort, pageSize } = req.query;

    try {
      switch (sort) {
        case 'likes':
          return res.status(200).json({
            blogs: await Blog.find({})
              .sort({ likes: -1 })
              .limit(Number(pageSize) || 10),
            message: 'Blogs Fetched Successfully',
          });

        case 'views':
          return res.status(200).json({
            blogs: await Blog.find({})
              .sort({ views: -1 })
              .limit(Number(pageSize) || 10),
            message: 'Blogs Fetched Successfully',
          });

        case 'latest':
          return res.status(200).json({
            blogs: await Blog.find({})
              .sort({ createdAt: -1 })
              .limit(Number(pageSize) || 10),
            message: 'Blogs Fetched Successfully',
          });

        default:
          return res.status(200).json({
            blogs: await Blog.find({}).limit(Number(pageSize) || 10),
            message: 'Blogs Fetched Successfully',
          });
      }
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);

handler.use(auth).use(parseMultipartForm);

handler.post(
  async (req: NextApiRequest & IUser & { files: any }, res: NextApiResponse<IMessage>) => {
    const { _id: _authorId } = req.user;

    const { title, content, genre, isPublished } = req.body;

    const storage = getStorage();

    try {
      if (isEmpty(req.files)) return res.status(403).json({ message: 'Image required' });

      const { _id: _blogId } = await Blog.create({
        author: _authorId,
        title,
        content,
        genre,
        isPublished,
      });

      const file = req.files.image;

      if (!file.mimetype.startsWith('image/'))
        return res.status(403).json({ message: 'Please choose an image' });

      const filename = file.mimetype.replace('image/', `${_blogId}.`);

      const storageRef = ref(storage, `blogs/${filename}`);

      const metadata = {
        contentType: file.mimetype,
      };

      await uploadBytes(storageRef, await fsPromises.readFile(file.filepath), metadata);

      const url = await getDownloadURL(storageRef);

      await Blog.findByIdAndUpdate(_blogId, {
        image: url,
        imageName: filename,
      });

      await User.findByIdAndUpdate(_authorId, { $push: { blogs: _blogId } });

      return res.status(200).json({ message: 'Blog Posted Successfully' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);

export default handler;
