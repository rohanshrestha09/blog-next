import { Blog } from './blog';
import { User } from './user';
import { Notification } from './notification';

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: User;
  blogId: number;
  blog: Blog;
  likedBy: User[];
  notifications: Notification[];
}
