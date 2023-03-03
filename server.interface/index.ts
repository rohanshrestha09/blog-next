import { Schema, Types } from 'mongoose';

export interface IUserSchema {
  fullname: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  provider: {
    type: string;
    enum: {
      values: String[];
      message: string;
    };
  };
  isSSO: boolean;
  verified: boolean;
  image: string;
  imageName: string;
  bookmarks: Types.ObjectId[];
  blogs: Types.ObjectId[];
  bio: string;
  website: string;
  followings: Types.ObjectId[];
  followers: Types.ObjectId[];
  following: number;
  follower: number;
}

export interface IBlogSchema {
  author: Types.ObjectId;
  image: string;
  imageName: string;
  title: string;
  content: string;
  genre: {
    type: StringConstructor[];
    required: [true, string];
    validate: [(val: any) => boolean, string];
    enum: { values: String[]; message: string };
  };
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  isPublished: boolean;
  like: number;
  comment: number;
}

export interface ICommentSchema {
  blog: Types.ObjectId;
  user: Types.ObjectId;
  comment: string;
  likes: Types.ObjectId[];
  like: number;
}

export interface INotificationSchema {
  type: {
    type: StringConstructor;
    required: [true, string];
    enum: { values: String[]; message: string };
  };
  user: Types.ObjectId;
  listener: Types.ObjectId[];
  blog: Types.ObjectId;
  comment: Types.ObjectId;
  description: string;
  status: {
    type: StringConstructor;
    enum: { values: String[]; message: string };
    default: NOTIFICATION_STATUS.UNREAD;
  };
}

export const genre: string[] = [
  'Technology',
  'Science',
  'Programming',
  'Fashion',
  'Food',
  'Travel',
  'Music',
  'Lifestyle',
  'Fitness',
  'DIY',
  'Sports',
  'Finance',
  'Gaming',
  'News',
  'Movie',
  'Personal',
  'Business',
  'Political',
];

export enum NOTIFICATION {
  FOLLOW_USER = 'followUser',
  LIKE_BLOG = 'likeBlog',
  LIKE_COMMENT = 'likeComment',
  POST_COMMENT = 'postComment',
  POST_BLOG = 'postBlog',
}

export enum NOTIFICATION_STATUS {
  READ = 'read',
  UNREAD = 'unread',
}
