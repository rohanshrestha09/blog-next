import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import Blog from '../../../../model/Blog';
import auth from '../../../../middleware/auth';
import middleware from '../../../../middleware/middleware';
import validateBlog from '../../../../middleware/validateBlog';
import IMessage from '../../../../interface/message';
import { IUser } from '../../../../interface/user';
import { IBlog } from '../../../../interface/blog';

const handler = nextConnect();

handler.use(middleware).use(auth).use(validateBlog);

handler.post(async (req: NextApiRequest & IUser & IBlog, res: NextApiResponse<IMessage>) => {
  const { _id: _blogId, likers } = req.blog;

  const { _id: _userId } = req.user;

  try {
    const likeExist = await Blog.findOne({
      $and: [{ _id: _blogId }, { likers: _userId }],
    });

    if (likeExist) return res.status(403).json({ message: 'Already Liked' });

    await Blog.findByIdAndUpdate(_blogId, {
      $push: { likers: _userId },
      likes: likers.length + 1,
    });

    return res.status(200).json({ message: 'Liked' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

handler.delete(async (req: NextApiRequest & IUser & IBlog, res: NextApiResponse<IMessage>) => {
  const { _id: _blogId, likers } = req.blog;

  const { _id: _userId } = req.user;

  try {
    const likeExist = await Blog.findOne({
      $and: [{ _id: _blogId }, { likers: _userId }],
    });

    if (!likeExist) return res.status(403).json({ message: 'ALready Unliked' });

    await Blog.findByIdAndUpdate(_blogId, {
      $pull: { likers: _userId },
      likes: likers.length - 1,
    });

    return res.status(200).json({ message: 'Unliked' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export default handler;
