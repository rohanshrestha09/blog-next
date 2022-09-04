import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import Blog from '../../../../model/Blog';
import init from '../../../../middleware/init';
import withAuth from '../../../../middleware/withAuth';
import withValidateBlog from '../../../../middleware/withValidateBlog';
import IMessage from '../../../../interface/message';
import { IUser } from '../../../../interface/user';
import { IBlog } from '../../../../interface/blog';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IUser & IBlog,
  res: NextApiResponse<IMessage>
) => {
  const { method } = req;

  if (method === 'POST') {
    const { _id: _blogId, viewers } = req.blog;

    const { _id: _userId } = req.user;

    try {
      const viewersExist = await Blog.findOne({
        $and: [{ _id: _blogId }, { viewers: _userId }],
      });

      if (viewersExist) return res.status(201);

      await Blog.findByIdAndUpdate(_blogId, {
        $push: { viewers: _userId },
        views: viewers.length + 1,
      });

      return res.status(200).json({ message: 'Success' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default withAuth(withValidateBlog(handler));
