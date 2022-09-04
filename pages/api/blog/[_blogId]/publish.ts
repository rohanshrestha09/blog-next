import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import Blog from '../../../../model/Blog';
import init from '../../../../middleware/init';
import withAuth from '../../../../middleware/withAuth';
import withValidateBlog from '../../../../middleware/withValidateBlog';
import { IBlog } from '../../../../interface/blog';
import IMessage from '../../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IBlog,
  res: NextApiResponse<IMessage>
) => {
  const {
    method,
    blog: { _id: _blogId },
  } = req;

  switch (method) {
    case 'POST':
      try {
        await Blog.findByIdAndUpdate(_blogId, { isPublished: true });

        return res.status(200).json({ message: 'Blog Published Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      try {
        await Blog.findByIdAndUpdate(_blogId, { isPublished: false });

        return res.status(200).json({ message: 'Blog Unpubished Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(withValidateBlog(handler));
