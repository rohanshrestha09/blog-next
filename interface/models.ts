export { type Genre, type Provider, NotificationType, NotificationStatus } from 'lib/prisma';

import {
  type User as UserSchema,
  type Blog as BlogSchema,
  type Comment as CommentSchema,
  type Notification as NotificationSchema,
} from 'lib/prisma';

export type User = Omit<UserSchema, 'password'> & {
  followedByViewer: boolean;
  followsViewer: boolean;
  _count: {
    followedBy: number;
    following: number;
  };
};

export type Blog = BlogSchema & {
  author: Omit<UserSchema, 'password'>;
  hasBookmarked: boolean;
  hasLiked: boolean;
  _count: {
    likedBy: number;
    comments: number;
  };
};

export type Comment = CommentSchema & {
  user: Omit<UserSchema, 'password'>;
  blog: BlogSchema;
  hasLiked: boolean;
  _count: {
    likedBy: number;
  };
};

export type Notification = NotificationSchema & {
  user: Omit<UserSchema, 'password'>;
  blog: BlogSchema;
  comment: CommentSchema;
};
