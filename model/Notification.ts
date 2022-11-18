import { Schema, model } from 'mongoose';
import { INotificationSchema, NOTIFICATION, NOTIFICATION_STATUS } from '../serverInterface';

const { UNREAD } = NOTIFICATION_STATUS;

const NotificationSchema = new Schema<INotificationSchema>(
  {
    type: {
      type: String,
      required: [true, 'Please provide notification type'],
      enum: {
        values: Object.values(NOTIFICATION),
        message: '{VALUE} not supported',
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Missing'],
    },
    listener: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Listener Missing'],
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    description: {
      type: String,
      required: [true, 'Description missing'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(NOTIFICATION_STATUS),
        message: '{VALUE} not supported',
      },
      default: UNREAD,
    },
  },
  { timestamps: true }
);

export default model<INotificationSchema>('Notification', NotificationSchema);
