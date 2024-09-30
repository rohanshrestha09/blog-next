import { Blog } from './blog';
import { User } from './user';
import { Notification } from './notification';

export interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  hasLiked?: boolean;
  userId: string;
  user?: User | null;
  blogId: number;
  blog?: Blog | null;
  likedBy?: User[];
  notifications?: Notification[];
}

export interface CommentQuery extends Partial<Pick<Comment, 'blogId'>> {}

export interface CommentCreate
  extends Omit<
    Comment,
    'id' | 'createdAt' | 'updatedAt' | 'user' | 'blog' | 'likedBy' | 'notifications'
  > {}
