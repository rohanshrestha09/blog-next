import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import User from '../../../../model/User';
import init from '../../../../middleware/init';
import withAuth from '../../../../middleware/withAuth';
import withValidateUser from '../../../../middleware/withValidateUser';
import IMessage from '../../../../interface/message';
import { IAuthReq, IUserReq } from '../../../../interface/user';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IUserReq & IAuthReq,
  res: NextApiResponse<IMessage>
) => {
  const {
    method,
    user: { _id: userId, followersCount },
    auth: { _id: authId, followingCount },
  } = req;

  switch (method) {
    case 'POST':
      if (authId.toString() === userId.toString())
        return res.status(403).json({ message: "Can't follow same user" });

      try {
        const followingExists = await User.findOne({
          $and: [{ _id: authId }, { following: userId }],
        });

        if (followingExists) return res.status(403).json({ message: 'Already Following' });

        await User.findByIdAndUpdate(authId, {
          $push: { following: userId },
          followingCount: followingCount + 1,
        });

        await User.findByIdAndUpdate(userId, {
          $push: { followers: authId },
          followersCount: followersCount + 1,
        });

        return res.status(200).json({ message: 'Follow Successful' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      if (authId.toString() === userId.toString())
        return res.status(403).json({ message: "Can't unfollow same user" });

      try {
        const followingExists = await User.findOne({
          $and: [{ _id: authId }, { following: userId }],
        });

        if (!followingExists) return res.status(403).json({ message: 'Not following' });

        await User.findByIdAndUpdate(authId, {
          $pull: { following: userId },
          followingCount: followingCount - 1,
        });

        await User.findByIdAndUpdate(userId, {
          $pull: { followers: authId },
          followersCount: followersCount - 1,
        });

        return res.status(200).json({ message: 'Unfollow Successful' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withAuth(withValidateUser(handler));
