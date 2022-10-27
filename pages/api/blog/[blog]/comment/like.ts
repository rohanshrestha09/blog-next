import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../../interface/next';
import Comment from '../../../../../model/Comment';
import init from '../../../../../middleware/init';
import withAuth from '../../../../../middleware/withAuth';
import withValidateBlog from '../../../../../middleware/withValidateBlog';
import { IAuthReq } from '../../../../../interface/user';
import IMessage from '../../../../../interface/message';
import { Types } from 'mongoose';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IAuthReq,
  res: NextApiResponse<IMessage>
) => {
  const {
    method,
    auth: { _id: authId },
    query: { commentId },
  } = req;

  switch (method) {
    case 'POST':
      try {
        const likeExist = await Comment.findOne({
          $and: [{ _id: commentId }, { likers: authId }],
        });

        if (likeExist) return res.status(403).json({ message: 'Already Liked' });

        const comment = await Comment.findById(commentId);

        if (!comment) return res.status(404).json({ message: 'Comment does not exist' });

        comment.likesCount += 1;

        comment.likers.push(authId);

        await comment.save();

        return res.status(200).json({ message: 'Liked' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      try {
        const likeExist = await Comment.findOne({
          $and: [{ _id: commentId }, { likers: authId }],
        });

        if (!likeExist) return res.status(403).json({ message: 'ALready Unliked' });

        const comment = await Comment.findById(commentId);

        if (!comment) return res.status(404).json({ message: 'Comment does not exist' });

        comment.likesCount -= 1;

        comment.likers = comment.likers.filter(
          (likers: Types.ObjectId) => likers.toString() !== authId.toString()
        );

        await comment.save();

        return res.status(200).json({ message: 'Unliked' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(withValidateBlog(handler));
