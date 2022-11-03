import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import { PipelineStage } from 'mongoose';
import Blog from '../../../../model/Blog';
import User from '../../../../model/User';
import init from '../../../../middleware/init';
import withAuth from '../../../../middleware/withAuth';
import { IAuthReq } from '../../../../interface/user';
import { IBlogs } from '../../../../interface/blog';
import IMessage from '../../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuthReq,
  res: NextApiResponse<IBlogs | IMessage>
) => {
  const {
    method,
    query: { sort, sortOrder, pageSize, genre, isPublished, search },
    auth: { blogs: blogIds },
  } = req;

  switch (method) {
    case 'GET':
      const query: PipelineStage[] = [
        { $match: { _id: { $in: blogIds } } },
        { $sort: { [String(sort || 'likes')]: sortOrder === 'asc' ? 1 : -1 } },
      ];

      if (genre) query.push({ $match: { genre: { $in: String(genre).split(',') } } });

      if (isPublished) query.push({ $match: { isPublished: isPublished === 'true' } });

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

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(handler);
