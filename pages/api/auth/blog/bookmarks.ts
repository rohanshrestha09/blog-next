import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import Blog from '../../../../model/Blog';
import init from '../../../../middleware/init';
import withAuth from '../../../../middleware/withAuth';
import { IAuth } from '../../../../interface/user';
import IMessage from '../../../../interface/message';
import { IBlogs } from '../../../../interface/blog';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuth,
  res: NextApiResponse<IBlogs | IMessage>
) => {
  const {
    method,
    query: { pageSize, genre, search },
    auth: { bookmarks },
  } = req;

  switch (method) {
    case 'GET':
      let query = { _id: bookmarks, isPublished: true };

      if (genre) query = Object.assign({ genre: { $in: String(genre).split(',') } }, query);

      if (search)
        query = Object.assign({ $text: { $search: String(search).toLowerCase() } }, query);

      try {
        return res.status(200).json({
          data: await Blog.find(query)
            .limit(Number(pageSize || 20))
            .populate('author', '-password'),
          count: await Blog.countDocuments(query),
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
