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
});

export default handler;
