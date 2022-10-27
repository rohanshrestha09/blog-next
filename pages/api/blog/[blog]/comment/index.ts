import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../../interface/next';
import init from '../../../../../middleware/init';
import Comment from '../../../../../model/Comment';
import Blog from '../../../../../model/Blog';
import withAuth from '../../../../../middleware/withAuth';
import withValidateBlog from '../../../../../middleware/withValidateBlog';
import { IAuthReq } from '../../../../../interface/user';
import { IBlogReq, IComments } from '../../../../../interface/blog';
import IMessage from '../../../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuthReq & IBlogReq,
  res: NextApiResponse<IComments | IMessage>
) => {
  const {
    method,
    blog: { _id: blogId, comments, commentsCount },
  } = req;

  switch (method) {
    case 'GET': {
      const { pageSize } = req.query;

      const dataComments = await Comment.find({ _id: comments })
        .limit(Number(pageSize || 20))
        .populate('user', 'fullname image');

      try {
        return res.status(200).json({
          data: dataComments as IComments['data'],
          count: await Comment.countDocuments({ _id: comments }),
          commentsCount: dataComments.length,
          message: 'Comments Fetched Successfully',
        });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }
    }

    case 'POST':
      const { _id: authId } = req.auth;

      const { comment } = req.body;

      try {
        const { _id: commentId } = await Comment.create({
          blog: blogId,
          user: authId,
          comment,
        });

        await Blog.findByIdAndUpdate(blogId, {
          $push: { comments: commentId },
          commentsCount: commentsCount + 1,
        });

        return res.status(200).json({ message: 'Comment Successfull' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      const { commentId } = req.query;

      try {
        await Comment.findByIdAndDelete(commentId);

        await Blog.findByIdAndUpdate(blogId, {
          $pull: { comments: commentId },
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
