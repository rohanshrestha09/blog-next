import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import { isEmpty } from 'lodash';
import User from '../../../../model/User';
import Blog from '../../../../model/Blog';
import init from '../../../../middleware/init';
import withAuth from '../../../../middleware/withAuth';
import withValidateBlog from '../../../../middleware/withValidateBlog';
import withParseMultipartForm from '../../../../middleware/withParseMultipartForm';
import uploadFile from '../../../../middleware/uploadFile';
import deleteFile from '../../../../middleware/deleteFile';
import { IBlog } from '../../../../interface/blog';
import { IAuth } from '../../../../interface/user';
import IMessage from '../../../../interface/message';
import IFiles from '../../../../interface/files';

export const config = {
  api: {
    bodyParser: false,
  },
};

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IBlog & IFiles & IAuth,
  res: NextApiResponse<IBlog | IMessage>
) => {
  const { method } = req;

  const { _id: blogId, image, imageName } = req.blog;

  switch (method) {
    case 'GET':
      const blog = req.blog;

      try {
        return res.status(200).json({ blog, message: 'Blog Fetched Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'PUT':
      const { title, content, genre } = req.body;

      try {
        if (!isEmpty(req.files)) {
          const file = req.files.image as any;

          if (!file.mimetype.startsWith('image/'))
            return res.status(403).json({ message: 'Please choose an image' });

          if (image && imageName) deleteFile(`blogs/${imageName}`);

          const filename = file.mimetype.replace('image/', `${blogId}.`);

          const fileUrl = await uploadFile(file, `blogs/${filename}`);

          await Blog.findByIdAndUpdate(blogId, {
            image: fileUrl,
            imageName: filename,
          });
        }

        await Blog.findByIdAndUpdate(blogId, {
          title,
          content,
          genre,
        });

        return res.status(200).json({ message: 'Blog Updated Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      const { _id: authId } = req.auth;

      try {
        if (image && imageName) deleteFile(`blogs/${imageName}`);

        await Blog.findByIdAndDelete(blogId);

        await User.findByIdAndUpdate(authId, { $pull: { blogs: blogId } });

        return res.status(200).json({ message: 'Blog Deleted Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(withValidateBlog(withParseMultipartForm(handler)));
