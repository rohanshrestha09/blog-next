import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import Blog from '../../../model/Blog';
import init from '../../../middleware/init';
import { IBlogs } from '../../../interface/blog';
import IMessage from '../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<IBlogs | IMessage>
) => {
  const { method } = req;

  if (method === 'GET') {
    const { genre, sort, pageSize } = req.query;

    try {
      switch (sort) {
        case 'likes':
          return res.status(200).json({
            blogs: await Blog.find({ genre })
              .sort({ likes: -1 })
              .limit(Number(pageSize) || 10),
            message: 'Blogs Fetched Successfully',
          });

        case 'views':
          return res.status(200).json({
            blogs: await Blog.find({ genre })
              .sort({ views: -1 })
              .limit(Number(pageSize) || 10),
            message: 'Blogs Fetched Successfully',
          });

        case 'latest':
          return res.status(200).json({
            blogs: await Blog.find({ genre })
              .sort({ createdAt: -1 })
              .limit(Number(pageSize) || 10),
            message: 'Blogs Fetched Successfully',
          });

        default:
          return res.status(200).json({
            blogs: await Blog.find({ genre }).limit(Number(pageSize) || 10),
            message: 'Blogs Fetched Successfully',
          });
      }
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default handler;
