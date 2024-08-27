import { User } from './user';
import { Comment } from './comment';
import { Notification } from './notification';
import { GENRE } from 'server/enums/genre';

export interface Blog {
  id: number;
  slug: string;
  title: string;
  content: string;
  image?: string | null;
  imageName?: string | null;
  genre: GENRE;
  isPublished: boolean;
  hasLiked?: boolean;
  hasBookmarked?: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: User;
  bookmarkedBy?: User[];
  likedBy?: User[];
  comments?: Comment[];
  notifications?: Notification[];
  _count?: {
    likedBy?: number;
    comments?: number;
  };
}

export interface BlogQuery extends Partial<Pick<Blog, 'isPublished' | 'authorId'>> {}

export interface BlogCreate
  extends Omit<
    Blog,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'hasLiked'
    | 'hasBookmarked'
    | 'author'
    | 'bookmarkedBy'
    | 'likedBy'
    | 'comments'
    | 'notifications'
  > {}

export interface BlogUpdate
  extends Partial<
    Omit<
      Blog,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'hasLiked'
      | 'hasBookmarked'
      | 'author'
      | 'bookmarkedBy'
      | 'likedBy'
      | 'comments'
      | 'notifications'
    >
  > {}
