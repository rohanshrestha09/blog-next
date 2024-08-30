import { Blog } from './blog';
import { User } from './user';
import { Comment } from './comment';
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS } from 'server/enums/notification';

export interface Notification {
  id: string;
  description: string;
  type: NOTIFICATION_TYPE;
  status: NOTIFICATION_STATUS;
  createdAt: Date;
  updatedAt: Date;
  senderId: string;
  sender?: User | null;
  receiverId: string;
  receiver?: User | null;
  blogId?: number | null;
  blog?: Blog | null;
  commentId?: number | null;
  comment?: Comment | null;
}

export interface NotificationQuery
  extends Partial<Pick<Notification, 'type' | 'status' | 'senderId' | 'receiverId'>> {}

export interface NotificationCreate
  extends Pick<Notification, 'type' | 'senderId' | 'receiverId' | 'description'> {}

export interface NotificationUpdate extends Partial<Pick<Notification, 'status'>> {}
