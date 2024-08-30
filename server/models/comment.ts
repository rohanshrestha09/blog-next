import { Blog } from './blog';
import { User } from './user';
import { Notification } from './notification';

export interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: User | null;
  blogId: number;
  blog?: Blog | null;
  likedBy?: User[];
  notifications?: Notification[];
}
