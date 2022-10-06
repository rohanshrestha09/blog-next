import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../interface/next';
import Blog from '../../../model/Blog';
import withValidateUser from '../../../middleware/withValidateUser';
import { IUser } from '../../../interface/user';
import { IBlogs } from '../../../interface/blog';
import IMessage from '../../../interface/message';

const handler: NextApiHandler = async (
  req: NextApiRequest & IUser,
  res: NextApiResponse<IBlogs | IMessage>
) => {
  const {
    method,
    query: { sort, pageSize, genre },
    user: { blogs },
  } = req;

  switch (method) {
    case 'GET':
      try {
        return res.status(200).json({
          blogs: await Blog.find(genre ? { blogs, genre } : { blogs })
            .sort({ [(sort as string) || 'likes']: -1 })
            .limit(Number(pageSize) || 20)
            .populate('author'),
          message: 'Blogs Fetched Successfully',
        });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withValidateUser(handler);
