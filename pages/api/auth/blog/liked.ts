import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import Blog from '../../../../model/Blog';
import withAuth from '../../../../middleware/withAuth';
import { IAuth } from '../../../../interface/user';
import IMessage from '../../../../interface/message';
import { ILiked } from '../../../../interface/blog';

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuth,
  res: NextApiResponse<ILiked | IMessage>
) => {
  const {
    method,
    query: { sort, pageSize, genre },
    auth: { liked },
  } = req;

  switch (method) {
    case 'GET':
      let query = { blogs: liked, isPublished: true };

      if (genre) query = Object.assign({ genre }, query);

      try {
        return res.status(200).json({
          liked: await Blog.find(query)
            .sort({ [sort as string]: -1 })
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
