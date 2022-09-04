import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import Blog from '../../../../model/Blog';
import init from '../../../../middleware/init';
import withAuth from '../../../../middleware/withAuth';
import withValidateBlog from '../../../../middleware/withValidateBlog';
import { IUser } from '../../../../interface/user';
import { IBlog } from '../../../../interface/blog';
import IMessage from '../../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IUser & IBlog,
  res: NextApiResponse<IMessage>
) => {
  const {
    method,
    user: { _id: _userId },
    blog: { _id: _blogId },
    body: { comment },
  } = req;

  switch (method) {
    case 'POST':
      try {
        await Blog.findByIdAndUpdate(_blogId, {
          $push: { comments: { commenter: _userId, comment } },
        });

        return res.status(200).json({ message: 'Comment Successfull' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      try {
        await Blog.findByIdAndUpdate(_blogId, {
          $pull: { comments: { commenter: _userId, comment } },
        });

        return res.status(200).json({ message: 'Comment Deleted Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(withValidateBlog(handler));
