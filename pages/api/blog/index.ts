import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import { PipelineStage } from 'mongoose';
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

        const query: PipelineStage[] = [
          { $match: { isPublished: true } },
          { $sort: { [String(sort || 'likes')]: -1 } },
        ];

        if (genre) query.push({ $match: { genre: { $in: String(genre).split(',') } } });

        if (search)
          query.unshift({
            $search: {
              index: 'blog-search',
              autocomplete: { query: String(search), path: 'title' },
            },
          });

        const blogs = await Blog.aggregate([...query, { $limit: Number(pageSize || 20) }]);

        await User.populate(blogs, { path: 'author', select: 'fullname image' });

        const [{ totalCount } = { totalCount: 0 }] = await Blog.aggregate([
          ...query,
          { $count: 'totalCount' },
        ]);

        try {
          return res.status(200).json({
            data: blogs,
            count: totalCount,
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
        const { _id: blogId } = await Blog.create({
          author: authId,
          title,
          content,
          genre,
          isPublished,
        });

        if (!isEmpty(req.files)) {
          const file = req.files.image as any;

          if (!file.mimetype.startsWith('image/'))
            return res.status(403).json({ message: 'Please choose an image' });

          const filename = file.mimetype.replace('image/', `${blogId}.`);

          const fileUrl = await uploadFile(file, `blogs/${filename}`);

          await Blog.findByIdAndUpdate(blogId, {
            image: fileUrl,
            imageName: filename,
          });
        }

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
