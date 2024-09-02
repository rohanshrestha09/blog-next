import { PusherController } from 'server/controllers/pusher';

export function getPusherController() {
  return new PusherController();
}
