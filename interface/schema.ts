import { Types } from 'mongoose';

export interface IUserSchema {
  fullname: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  image: string;
  imageName: string;
  bookmarks: Types.ObjectId[];
  blogs: Types.ObjectId[];
  bio: string;
  website: string;
  following: Types.ObjectId[];
  followingCount: number;
  followers: Types.ObjectId[];
  followersCount: number;
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
  likers: Types.ObjectId[];
  likesCount: number;
  comments: Types.ObjectId[];
  commentsCount: number;
  isPublished: boolean;
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
  likers: Types.ObjectId[];
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}
