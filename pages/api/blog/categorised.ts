import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import Blog from '../../../model/Blog';
import middleware from '../../../middleware/middleware';
import { IBlog } from '../../../interface/blog';
import IMessage from '../../../interface/message';

const handler = nextConnect();

handler.use(middleware);

handler.get(async (req: NextApiRequest, res: NextApiResponse<{ blogs: IBlog[] } | IMessage>) => {
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
});

export default handler;
