import { Document, Types } from 'mongoose';
import { INotificationSchema } from './schema';
import IMessage from './message';

export type INotificationData = Omit<
  Document<unknown, any, INotificationSchema> &
    INotificationSchema & { _id: Types.ObjectId & string },
  never
>;

export interface INotifications extends IMessage {
  data: INotificationData[];
  count: number;
  read: number;
  unread: number;
}
