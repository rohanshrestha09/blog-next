import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import Blog from '../../../../model/Blog';
import init from '../../../../middleware/init';
import withAuth from '../../../../middleware/withAuth';
import withValidateBlog from '../../../../middleware/withValidateBlog';
import { IAuthReq } from '../../../../interface/user';
import { IBlogReq } from '../../../../interface/blog';
import IMessage from '../../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuthReq & IBlogReq,
  res: NextApiResponse<IMessage>
) => {
  const {
    method,
    auth: { _id: authId },
    blog: { _id: blogId, commentsCount },
    body: { comment },
  } = req;

  switch (method) {
    case 'POST':
      try {
        await Blog.findByIdAndUpdate(blogId, {
          $push: { comments: { commenter: authId, comment } },
          commentsCount: commentsCount + 1,
        });

        return res.status(200).json({ message: 'Comment Successfull' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      try {
        await Blog.findByIdAndUpdate(blogId, {
          $pull: { comments: { commenter: authId, comment } },
          commentsCount: commentsCount - 1,
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
