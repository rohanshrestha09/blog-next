import { MutableRefObject } from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUserData } from './user';

interface IContext {
  authUser: IUserData;
  socket: MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap>>;
}
export default IContext;
