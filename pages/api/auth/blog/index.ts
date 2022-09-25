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
    query: { sort, pageSize, genre, isPublished },
    auth: { blogs },
  } = req;

  switch (method) {
    case 'GET':
      let query = { blogs };

      if (genre) query = Object.assign({ genre }, query);

      if (isPublished) query = Object.assign({ isPublished: isPublished === 'true' }, query);

      try {
        return res.status(200).json({
          blogs: await Blog.find(query)
            .sort({ [(sort as string) || 'likes']: -1 })
            .limit(Number(pageSize) || 20),
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
