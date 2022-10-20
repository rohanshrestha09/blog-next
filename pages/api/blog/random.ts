import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import Blog from '../../../model/Blog';
import init from '../../../middleware/init';
import IMessage from '../../../interface/message';
import { IBlogs } from '../../../interface/blog';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<IBlogs | IMessage>
) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      const { pageSize } = req.query;

      try {
        return res.status(200).json({
          data: await Blog.aggregate([
            { $sample: { size: Number(pageSize || 4) }, $match: { isPublished: true } },
          ]),
          count: await Blog.countDocuments({ isPublished: true }),
          message: 'Blogs Fetched Successfully',
        });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
