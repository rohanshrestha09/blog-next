import Pusher from 'pusher';
import { notificationFields, prisma } from './prisma';

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET as string,
  cluster: process.env.PUSHER_CLUSTER as string,
  useTLS: true,
});

export const dispatchNotification = async ({
  receiver,
  notificationId,
}: {
  receiver: string;
  notificationId: string;
}) => {
  const notification = await prisma.notification.findUniqueOrThrow({
    where: {
      id: notificationId,
    },
    select: {
      ...notificationFields,
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      blog: {
        select: {
          id: true,
          slug: true,
          title: true,
          image: true,
        },
      },
      comment: {
        select: {
          id: true,
          content: true,
        },
      },
    },
  });

  pusher.sendToUser(receiver, 'dispatch-notification', notification);
};
