import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import Blog from '../../../../model/Blog';
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
    query: { pageSize },
    auth: { following },
  } = req;

  switch (method) {
    case 'GET':
      let query = { author: following, isPublished: true };

      try {
        return res.status(200).json({
          data: await Blog.find(query)
            .limit(Number(pageSize || 20))
            .populate('author', 'fullname image'),
          count: await Blog.countDocuments(query),
          message: 'Following Blogs Fetched Successfully',
        });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(handler);
