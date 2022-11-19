import { Socket } from 'socket.io';

declare namespace NodeJS {
  interface Global {
    users: Map<string, string>;
    chatSocket: Socket;
  }
}

declare const global: NodeJS.Global & typeof globalThis;

const dispatchSocket = async (io: Socket) => {
  global.users = new Map();

  io.on('connection', (socket) => {
    global.chatSocket = socket;

    socket.on('add user', (user: string) => {
      global.users.set(user, socket.id);
    });

    socket.on('dispatch notification', (listeners: string[]) => {
      const users = listeners
        .map((listener) => global.users.get(listener))
        .filter((listener) => listener !== undefined) as string[];

      io.to(users).emit('incoming notification');
    });
  });
};

export default dispatchSocket;
