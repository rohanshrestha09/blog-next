import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import Blog from '../../../../model/Blog';
import auth from '../../../../middleware/auth';
import middleware from '../../../../middleware/middleware';
import validateBlog from '../../../../middleware/validateBlog';
import { IBlog } from '../../../../interface/blog';
import IMessage from '../../../../interface/message';

const handler = nextConnect();

handler.use(middleware).use(auth).use(validateBlog);

handler.post(async (req: NextApiRequest & IBlog, res: NextApiResponse<IMessage>) => {
  const { _id: _blogId } = req.blog;

  try {
    await Blog.findByIdAndUpdate(_blogId, { isPublished: true });

    return res.status(200).json({ message: 'Blog Published Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

handler.delete(async (req: NextApiRequest & IBlog, res: NextApiResponse<IMessage>) => {
  const { _id: _blogId } = req.blog;

  try {
    await Blog.findByIdAndUpdate(_blogId, { isPublished: false });

    return res.status(200).json({ message: 'Blog Unpubished Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export default handler;
