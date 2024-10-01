import { Blog } from './blog';
import { User } from './user';

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
  _count: {
    likedBy?: number;
  };
}
