import { Blog } from './blog';
import { Comment } from './comment';
import { Notification } from './notification';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  image?: string | null;
  imageName?: string | null;
  bio?: string | null;
  website?: string | null;
  provider: 'EMAIL' | 'GOOGLE';
  isSSO: boolean;
  isVerified: boolean;
  followsViewer?: boolean;
  followedByViewer?: boolean;
  createdAt: Date;
  updatedAt: Date;
  blogs?: Blog[];
  comments?: Comment[];
  following?: User[];
  followedBy?: User[];
  likedBlogs?: Blog[];
  likedComments?: Comment[];
  bookmarkedBlogs?: Blog[];
  sentNotifications?: Notification[];
  receivedNotifications?: Notification[];
  _count?: {
    following?: number;
    followedBy?: number;
  };
}

export interface UserCreate
  extends Omit<
    User,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'isSSO'
    | 'provider'
    | 'followsViewer'
    | 'followedByViewer'
    | 'blogs'
    | 'comments'
    | 'following'
    | 'followedBy'
    | 'likedBlogs'
    | 'likedComments'
    | 'bookmarkedBlogs'
    | 'sentNotifications'
    | 'receivedNotifications'
  > {}

export interface UserUpdate
  extends Partial<
    Omit<
      User,
      | 'followsViewer'
      | 'followedByViewer'
      | 'blogs'
      | 'comments'
      | 'following'
      | 'followedBy'
      | 'likedBlogs'
      | 'likedComments'
      | 'bookmarkedBlogs'
      | 'sentNotifications'
      | 'receivedNotifications'
    >
  > {}
