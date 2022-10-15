import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import User from '../../../../model/User';
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
    blog: { _id: blogId, likesCount },
  } = req;

  switch (method) {
    case 'POST':
      try {
        const likeExist = await Blog.findOne({
          $and: [{ _id: blogId }, { likers: authId }],
        });

        if (likeExist) return res.status(403).json({ message: 'Already Liked' });

        await Blog.findByIdAndUpdate(blogId, {
          $push: { likers: authId },
          likes: likesCount + 1,
        });

        await User.findByIdAndUpdate(authId, {
          $push: { liked: blogId },
        });

        return res.status(200).json({ message: 'Liked' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      try {
        const likeExist = await Blog.findOne({
          $and: [{ _id: blogId }, { likers: authId }],
        });

        if (!likeExist) return res.status(403).json({ message: 'ALready Unliked' });

        await Blog.findByIdAndUpdate(blogId, {
          $pull: { likers: authId },
          likes: likesCount - 1,
        });

        await User.findByIdAndUpdate(authId, {
          $pull: { liked: blogId },
        });

        return res.status(200).json({ message: 'Unliked' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(withValidateBlog(handler));
