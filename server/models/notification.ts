import { Blog } from './blog';
import { User } from './user';
import { Comment } from './comment';
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS } from 'server/enums/nofitication';

export interface Notification {
  id: string;
  description: string;
  type: NOTIFICATION_TYPE;
  status: NOTIFICATION_STATUS;
  createdAt: Date;
  updatedAt: Date;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  blogId?: number | null;
  blog?: Blog | null;
  commentId?: number | null;
  comment?: Comment | null;
}
