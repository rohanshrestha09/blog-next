import Pusher from 'pusher';
import { Notification } from './prisma';

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET as string,
  cluster: process.env.PUSHER_CLUSTER as string,
  useTLS: true,
});

export const dispatchNotification = async (notification: Notification) => {
  pusher.sendToUser(notification.receiverId, 'dispatch-notification', notification);
};
