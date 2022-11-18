import { Schema, model, Types } from 'mongoose';

interface INotificationSchema {
  type: {
    type: StringConstructor;
    required: [true, string];
    enum: { values: String[]; message: string };
  };
  user: Types.ObjectId;
  listener: Types.ObjectId;
  blog: Types.ObjectId;
  comment: Types.ObjectId;
  description: string;
  status: {
    type: StringConstructor;
    enum: { values: String[]; message: string };
    default: 'unread';
  };
}

const NotificationSchema = new Schema<INotificationSchema>(
  {
    type: {
      type: String,
      required: [true, 'Please provide notification type'],
      enum: {
        values: ['followUser', 'likeBlog', 'likeComment', 'postComment', 'postBlog'],
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
        values: ['read', 'unread'],
        message: '{VALUE} not supported',
      },
      default: 'unread',
    },
  },
  { timestamps: true }
);

export default model<INotificationSchema>('Notification', NotificationSchema);
