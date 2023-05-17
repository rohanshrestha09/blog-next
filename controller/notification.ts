import { Request, Response } from 'express';
import Notification from '../model/Notification';
import { NOTIFICATION_STATUS } from '../server.interface';

const asyncHandler = require('express-async-handler');

const { READ, UNREAD } = NOTIFICATION_STATUS;

export const notifications = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { _id: authId } = res.locals.auth;

    const { size } = req.query;

    return res.status(200).json({
      data: await Notification.find({ listener: { $in: authId } })
        .sort({ createdAt: -1 })
        .limit(Number(size || 20))
        .populate('user', 'fullname image')
        .populate('blog', 'title image')
        .populate('comment', 'comment'),
      count: await Notification.countDocuments({ listener: { $in: authId } }),
      read: await Notification.countDocuments({
        $and: [{ listener: { $in: authId } }, { status: READ }],
      }),
      unread: await Notification.countDocuments({
        $and: [{ listener: { $in: authId } }, { status: UNREAD }],
      }),
      message: 'Notifications fetched successfully',
    });
  }
);

export const markAsRead = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { notification: notificationId } = req.params;

  const { _id: authId } = res.locals.auth;

  await Notification.findOneAndUpdate(
    { _id: notificationId, listener: { $in: authId } },
    { status: READ }
  );

  return res.status(201).json({ message: 'Notification updated successfully' });
});

export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { _id: authId } = res.locals.auth;

    await Notification.updateMany({ listener: { $in: authId } }, { status: READ });

    return res.status(201).json({ message: 'Notifications updated successfully' });
  }
);
