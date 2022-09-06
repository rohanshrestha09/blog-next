import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import User from '../../../../model/User';
import init from '../../../../middleware/init';
import withAuth from '../../../../middleware/withAuth';
import withValidateUser from '../../../../middleware/withValidateUser';
import IMessage from '../../../../interface/message';
import { IQueryUser, IUser } from '../../../../interface/user';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest & IUser & IQueryUser,
  res: NextApiResponse<IMessage>
) => {
  const {
    method,
    queryUser: { _id: _queryUserId, followerCount },
    user: { _id: _userId, followingCount },
  } = req;

  switch (method) {
    case 'POST':
      if (_userId === _queryUserId)
        return res.status(403).json({ message: "Can't follow same user" });

      try {
        const followingExists = await User.findOne({
          $and: [{ _id: _userId }, { following: _queryUserId }],
        });

        if (followingExists) return res.status(403).json({ message: 'Already Following' });

        await User.findByIdAndUpdate(_userId, {
          $push: { following: _queryUserId },
          followingCount: followingCount + 1,
        });

        await User.findByIdAndUpdate(_queryUserId, {
          $push: { followers: _userId },
          followerCount: followerCount + 1,
        });

        return res.status(200).json({ message: 'Follow Successful' });
      } catch (err: Error | any) {
        return res.status(404).json({ message: err.message });
      }

    case 'DELETE':
      if (_userId === _queryUserId)
        return res.status(403).json({ message: "Can't unfollow same user" });

      try {
        const followingExists = await User.findOne({
          $and: [{ _id: _userId }, { following: _queryUserId }],
        });

        if (!followingExists) return res.status(403).json({ message: 'Not following' });

        await User.findByIdAndUpdate(_userId, {
          $pull: { following: _queryUserId },
          followingCount: followingCount - 1,
        });

        await User.findByIdAndUpdate(_queryUserId, {
          $pull: { followers: _userId },
          followerCount: followerCount - 1,
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
