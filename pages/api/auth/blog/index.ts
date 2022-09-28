import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import Blog from '../../../../model/Blog';
import withAuth from '../../../../middleware/withAuth';
import { IAuth } from '../../../../interface/user';
import { IBlogs } from '../../../../interface/blog';
import IMessage from '../../../../interface/message';

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuth,
  res: NextApiResponse<IBlogs | IMessage>
) => {
  const {
    method,
    query: { sort, sortOrder, pageSize, genre, isPublished, search },
    auth: { blogs },
  } = req;

  switch (method) {
    case 'GET':
      let query = { blogs };

      if (genre)
        query = Object.assign(
          {
            genre: {
              $in: Array.isArray(genre) ? genre : typeof genre === 'string' && genre.split(','),
            },
          },
          query
        );

      if (isPublished) query = Object.assign({ isPublished: isPublished === 'true' }, query);

      if (search)
        query = Object.assign({
          title: { $inc: typeof search === 'string' && search.toLowerCase() },
        });

      try {
        return res.status(200).json({
          blogs: await Blog.find(query)
            .sort({ [(typeof sort === 'string' && sort) || 'likes']: sortOrder === 'asc' ? 1 : -1 })
            .limit(Number(pageSize || 20)),
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
