import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import Blog from '../../../../model/Blog';
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

  const { comment } = req.body;

  try {
    await Blog.findByIdAndUpdate(_blogId, {
      $push: { comments: { commenter: _userId, comment } },
    });

    return res.status(200).json({ message: 'Comment Successfull' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

handler.delete(async (req: NextApiRequest & IUser & IBlog, res: NextApiResponse<IMessage>) => {
  const { _id: _blogId } = req.blog;

  const { _id: _userId } = req.user;

  const { comment } = req.body;
  try {
    await Blog.findByIdAndUpdate(_blogId, {
      $pull: { comments: { commenter: _userId, comment } },
    });

    return res.status(200).json({ message: 'Comment Deleted Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export default handler;
