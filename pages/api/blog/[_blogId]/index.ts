import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import fs from 'fs';
import { isEmpty } from 'lodash';
import User from '../../../../model/User';
import Blog from '../../../../model/Blog';
import middleware from '../../../../middleware/middleware';
import auth from '../../../../middleware/auth';
import parseMultipartForm from '../../../../middleware/parseMultipartForm';
import validateBlog from '../../../../middleware/validateBlog';
import IMessage from '../../../../interface/message';
import { IBlog } from '../../../../interface/blog';
import { IUser } from '../../../../interface/user';

export const config = {
  api: {
    bodyParser: false,
  },
};

const fsPromises = fs.promises;

const handler = nextConnect();

handler.use(middleware).use(validateBlog);

handler.get(async (req: NextApiRequest & IBlog, res: NextApiResponse<IBlog | IMessage>) => {
  const blog = req.blog;

  try {
    return res.status(200).json({ blog, message: 'Blog Fetched Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

handler.use(auth).use(parseMultipartForm);

handler.put(
  async (req: NextApiRequest & IBlog & { files: any }, res: NextApiResponse<IMessage>) => {
    const { _id: _blogId, image, imageName } = req.blog;

    const { title, content, genre } = req.body;

    const storage = getStorage();

    try {
      if (isEmpty(req.files)) return res.status(403).json({ message: 'Image required' });

      const file = req.files.image;

      if (!file.mimetype.startsWith('image/'))
        return res.status(403).json({ message: 'Please choose an image' });

      if (image) deleteObject(ref(storage, `blogs/${imageName}`));

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
        title,
        content,
        genre,
      });

      return res.status(200).json({ message: 'Blog Updated Successfully' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);

handler.delete(async (req: NextApiRequest & IBlog & IUser, res: NextApiResponse<IMessage>) => {
  const { _id: _blogId, image, imageName } = req.blog;

  const { _id: _authorId } = req.user;

  const storage = getStorage();

  try {
    if (image) deleteObject(ref(storage, `blogs/${imageName}`));

    await Blog.findByIdAndDelete(_blogId);

    await User.findByIdAndUpdate(_authorId, { $pull: { blogs: _blogId } });

    return res.status(200).json({ message: 'Blog Deleted Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export default handler;
