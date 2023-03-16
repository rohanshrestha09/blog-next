import { Types } from 'mongoose';
import { NOTIFICATIONS_STATUS, NOTIFICATIONS_TYPE } from '../constants/reduxKeys';

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
  isVerified: boolean;
  image: string;
  imageName: string;
  bio: string;
  website: string;
  followingCount: number;
  followerCount: number;
  followsViewer: boolean;
  followedByViewer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogSchema {
  author: {
    type: Types.ObjectId;
    ref: 'User';
    _id: Types.ObjectId;
    fullname: string;
    image: string;
  };
  image: string;
  imageName: string;
  title: string;
  content: string;
  genre: {
    type: StringConstructor[] | string[];
    required: [true, string];
    validate: [(val: any) => boolean, string];
    enum: { values: String[]; message: string };
    map: (tag: any) => JSX.Element;
  };
  isPublished: boolean;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  hasBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentSchema {
  blog: { type: Types.ObjectId; ref: 'Blog' };
  user: {
    type: Types.ObjectId;
    ref: 'User';
    _id: Types.ObjectId;
    fullname: string;
    image: string;
  };
  comment: string;
  likeCount: number;
  hasLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationSchema {
  type: {
    type: StringConstructor;
    required: [true, string];
    enum: { values: String[]; message: string };
  } & NOTIFICATIONS_TYPE;
  user: {
    type: Types.ObjectId;
    ref: 'User';
    _id: Types.ObjectId;
    fullname: string;
    image: string;
  };
  listener: Types.ObjectId | Types.ObjectId[];
  blog?: {
    type: Types.ObjectId;
    ref: 'Blog';
    _id: Types.ObjectId;
    title: string;
    image: string;
  };
  comment?: {
    type: Types.ObjectId;
    ref: 'Comment';
    _id: Types.ObjectId;
    blog: Types.ObjectId;
    comment: string;
  };
  description: string;
  status: {
    type: StringConstructor;
    enum: { values: String[]; message: string };
    default: 'unread';
  } & NOTIFICATIONS_STATUS;
  createdAt: Date;
  updatedAt: Date;
}
