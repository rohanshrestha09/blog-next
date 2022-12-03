import { Types } from 'mongoose';
import { Socket } from 'socket.io';
import { io } from 'socket.io-client';
import { isEmpty } from 'lodash';
import Notification from '../model/Notification';

declare namespace NodeJS {
  interface Global {
    users: Map<string, string>;
    chatSocket: Socket;
  }
}

declare const global: NodeJS.Global & typeof globalThis;

export const dispatchNotification = ({
  listeners,
  notificationId,
}: {
  listeners: string[];
  notificationId: Types.ObjectId;
}) => {
  const socket = io('http://127.0.0.1:5000');

  socket.emit('dispatch notification', { listeners, notificationId });
};

const dispatchSocket = async (io: Socket) => {
  global.users = new Map();

  io.on('connection', (socket) => {
    global.chatSocket = socket;

    socket.on('add user', (user: string) => {
      global.users.set(user, socket.id);
    });

    socket.on(
      'dispatch notification',
      async ({ listeners, notificationId }: { listeners: string[]; notificationId: string }) => {
        const users: string[] = [];

        listeners.forEach((listener) => {
          const user = global.users.get(listener);

          if (user) users.push(user);
        });

        if (!isEmpty(users))
          io.to(users).emit(
            'incoming notification',
            await Notification.findById(notificationId)
              .populate('user', 'fullname image')
              .populate('blog', 'title image')
              .populate('comment', 'comment')
          );
      }
    );
  });
};

export default dispatchSocket;
