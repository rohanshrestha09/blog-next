import { Request, Response } from 'express';
import Notification from '../model/Notification';
import { NOTIFICATION_STATUS } from '../serverInterface';

const asyncHandler = require('express-async-handler');

const { READ } = NOTIFICATION_STATUS;

export const notifications = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { _id: authId } = res.locals.auth;

    const { pageSize } = req.query;

    try {
      return res.status(200).json({
        data: await Notification.find({ listener: { $in: authId } })
          .sort({ createdAt: -1 })
          .limit(Number(pageSize || 20))
          .populate('user', 'fullname image')
          .populate('blog', 'title image')
          .populate('comment', 'comment blog'),
        count: await Notification.countDocuments({ listener: { $in: authId } }),
        message: 'Notifications fetched successfully',
      });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);

export const markAsRead = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { notification: notificationId } = req.params;

  try {
    await Notification.findByIdAndUpdate(notificationId, { status: READ });

    return res.status(200).json({ message: 'Notification updated successfully' });
  } catch (err: Error | any) {
    return res.status(400).json({ message: err.message });
  }
});

export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    try {
      await Notification.updateMany({}, { status: READ });

      return res.status(200).json({ message: 'Notifications updated successfully' });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);
