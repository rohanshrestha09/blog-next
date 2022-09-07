import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import User from '../../../../model/User';
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
    blog: { _id: _blogId, likers },
  } = req;

  switch (method) {
    case 'POST':
      try {
        const likeExist = await Blog.findOne({
          $and: [{ _id: _blogId }, { likers: _userId }],
        });

        if (likeExist) return res.status(403).json({ message: 'Already Liked' });

        await Blog.findByIdAndUpdate(_blogId, {
          $push: { likers: _userId },
          likes: likers.length + 1,
        });

        await User.findByIdAndUpdate(_userId, {
          $push: { liked: _blogId },
        });

        return res.status(200).json({ message: 'Liked' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      try {
        const likeExist = await Blog.findOne({
          $and: [{ _id: _blogId }, { likers: _userId }],
        });

        if (!likeExist) return res.status(403).json({ message: 'ALready Unliked' });

        await Blog.findByIdAndUpdate(_blogId, {
          $pull: { likers: _userId },
          likes: likers.length - 1,
        });

        await User.findByIdAndUpdate(_userId, {
          $pull: { liked: _blogId },
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
