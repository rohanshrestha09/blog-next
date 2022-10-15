import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import Blog from '../../../../model/Blog';
import withValidateUser from '../../../../middleware/withValidateUser';
import { IUserReq } from '../../../../interface/user';
import { IBlogs } from '../../../../interface/blog';
import IMessage from '../../../../interface/message';

const handler: NextApiHandler = async (
  req: NextApiRequest & IUserReq,
  res: NextApiResponse<IBlogs | IMessage>
) => {
  const {
    method,
    query: { pageSize },
    user: { blogs },
  } = req;

  switch (method) {
    case 'GET':
      try {
        return res.status(200).json({
          data: await Blog.find({ _id: blogs, isPublished: true })
            .sort({ likes: -1 })
            .limit(Number(pageSize || 20))
            .populate('author', '-password'),
          count: await Blog.countDocuments({ _id: blogs, isPublished: true }),
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
