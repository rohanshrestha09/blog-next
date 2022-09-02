import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import User from '../../../../model/User';
import auth from '../../../../middleware/auth';
import middleware from '../../../../middleware/middleware';
import validateBlog from '../../../../middleware/validateBlog';
import { IUser } from '../../../../interface/user';
import { IBlog } from '../../../../interface/blog';
import IMessage from '../../../../interface/message';

const handler = nextConnect();

handler.use(middleware).use(auth).use(validateBlog);

handler.post(async (req: NextApiRequest & IUser & IBlog, res: NextApiResponse<IMessage>) => {
  const { _id: _blogId } = req.blog;

  const { _id: _userId } = req.user;
  try {
    const bookmarkExist = await User.findOne({
      $and: [{ _id: _userId }, { bookmarks: _blogId }],
    });

    if (bookmarkExist) return res.status(403).json({ message: 'Already Bookmarked' });

    await User.findByIdAndUpdate(_userId, { $push: { bookmarks: _blogId } });

    return res.status(200).json({ message: 'Bookmarked Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

handler.delete(async (req: NextApiRequest & IUser & IBlog, res: NextApiResponse<IMessage>) => {
  const { _id: _blogId } = req.blog;

  const { _id: _userId } = req.user;
  try {
    const bookmarkExist = await User.findOne({
      $and: [{ _id: _userId }, { bookmarks: _blogId }],
    });

    if (!bookmarkExist) return res.status(403).json({ message: 'Already Unbookmarked' });

    await User.findByIdAndUpdate(_userId, { $pull: { bookmarks: _blogId } });

    return res.status(200).json({ message: 'Unbookmarked Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export default handler;
