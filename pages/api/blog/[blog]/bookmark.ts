import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import init from '../../../../middleware/init';
import withAuth from '../../../../middleware/withAuth';
import withValidateBlog from '../../../../middleware/withValidateBlog';
import User from '../../../../model/User';
import { IAuth } from '../../../../interface/user';
import { IBlog } from '../../../../interface/blog';
import IMessage from '../../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuth & IBlog,
  res: NextApiResponse<IMessage>
) => {
  const {
    method,
    auth: { _id: authId },
    blog: { _id: blogId },
  } = req;

  switch (method) {
    case 'POST':
      try {
        const bookmarkExist = await User.findOne({
          $and: [{ _id: authId }, { bookmarks: blogId }],
        });

        if (bookmarkExist) return res.status(403).json({ message: 'Already Bookmarked' });

        await User.findByIdAndUpdate(authId, { $push: { bookmarks: blogId } });

        return res.status(200).json({ message: 'Bookmarked Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      try {
        const bookmarkExist = await User.findOne({
          $and: [{ _id: authId }, { bookmarks: blogId }],
        });

        if (!bookmarkExist) return res.status(403).json({ message: 'Already Unbookmarked' });

        await User.findByIdAndUpdate(authId, { $pull: { bookmarks: blogId } });

        return res.status(200).json({ message: 'Unbookmarked Successfully' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(withValidateBlog(handler));
