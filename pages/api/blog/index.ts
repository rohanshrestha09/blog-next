import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import { isEmpty } from 'lodash';
import User from '../../../model/User';
import Blog from '../../../model/Blog';
import init from '../../../middleware/init';
import withAuth from '../../../middleware/withAuth';
import withParseMultipartForm from '../../../middleware/withParseMultipartForm';
import uploadFile from '../../../middleware/uploadFile';
import { IAuthReq } from '../../../interface/user';
import IMessage from '../../../interface/message';
import { IBlogs } from '../../../interface/blog';
import IFiles from '../../../interface/files';

export const config = {
  api: {
    bodyParser: false,
  },
};

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuthReq & IFiles,
  res: NextApiResponse<IBlogs | IMessage>
) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      (async () => {
        const { sort, pageSize, genre, search } = req.query;

        let query = { isPublished: true };

        if (genre) query = Object.assign({ genre: { $in: String(genre).split(',') } }, query);

        if (search)
          query = Object.assign({ $text: { $search: String(search).toLowerCase() } }, query);

        try {
          return res.status(200).json({
            data: await Blog.find(query)
              .sort({ [String(sort) || 'likes']: -1 })
              .limit(Number(pageSize || 20))
              .populate('author', '-password'),
            count: await Blog.countDocuments(query),
            message: 'Blogs Fetched Successfully',
          });
        } catch (err: Error | any) {
          return res.status(404).json({ message: err.message });
        }
      })();
      break;

    case 'POST':
      const { _id: authId } = req.auth;

      const { title, content, genre, isPublished } = req.body;

      try {
        if (isEmpty(req.files)) return res.status(403).json({ message: 'Image required' });

        const { _id: blogId } = await Blog.create({
          author: authId,
          title,
          content,
          genre,
          isPublished,
        });

        const file = req.files.image as any;

        if (!file.mimetype.startsWith('image/'))
          return res.status(403).json({ message: 'Please choose an image' });

        const filename = file.mimetype.replace('image/', `${blogId}.`);

        const fileUrl = await uploadFile(file, `blogs/${filename}`);

        await Blog.findByIdAndUpdate(blogId, {
          image: fileUrl,
          imageName: filename,
        });

        await User.findByIdAndUpdate(authId, { $push: { blogs: blogId } });

        return res.status(200).json({ message: 'Blog Posted Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(withParseMultipartForm(handler));
