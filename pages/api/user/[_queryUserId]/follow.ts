import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import User from '../../../../model/User';
import auth from '../../../../middleware/auth';
import middleware from '../../../../middleware/middleware';
import validateUser from '../../../../middleware/validateUser';
import IMessage from '../../../../interface/message';
import { IQueryUser, IUser } from '../../../../interface/user';

const handler = nextConnect();

handler.use(middleware).use(auth).use(validateUser);

handler.post(async (req: NextApiRequest & IUser & IQueryUser, res: NextApiResponse<IMessage>) => {
  const { _id: _queryUserId } = req.queryUser;

  const { _id: _userId } = req.user;

  if (_userId === _queryUserId) return res.status(403).json({ message: "Can't follow same user" });

  try {
    const followingExists = await User.findOne({
      $and: [{ _id: _userId }, { following: _queryUserId }],
    });

    if (followingExists) return res.status(403).json({ message: 'Already Following' });

    await User.findByIdAndUpdate(_userId, {
      $push: { following: _queryUserId },
    });

    await User.findByIdAndUpdate(_queryUserId, {
      $push: { followers: _userId },
    });

    return res.status(200).json({ message: 'Follow Successful' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

handler.delete(async (req: NextApiRequest & IUser & IQueryUser, res: NextApiResponse<IMessage>) => {
  const { _id: _queryUserId } = req.queryUser;

  const { _id: _userId } = req.user;

  if (_userId === _queryUserId)
    return res.status(403).json({ message: "Can't unfollow same user" });

  try {
    const followingExists = await User.findOne({
      $and: [{ _id: _userId }, { following: _queryUserId }],
    });

    if (!followingExists) return res.status(403).json({ message: 'Not following' });

    await User.findByIdAndUpdate(_userId, {
      $pull: { following: _queryUserId },
    });

    await User.findByIdAndUpdate(_queryUserId, {
      $pull: { followers: _userId },
    });

    return res.status(200).json({ message: 'Unfollow Successful' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export default handler;
