import IMessage from './message';
import { IUserData } from './user';

type BlogKeys = Record<string, string | string[]>;

export interface IBlogData extends IMessage {
  _id: string;
  author: {
    _id: IUserData['_id'];
    fullname: IUserData['fullname'];
    image: IUserData['image'];
  };
  image: string;
  imageName: string;
  title: string;
  content: string;
  genre: string[];
  likers: string[] | [];
  likesCount: number;
  viewers: string[] | [];
  views: number;
  isPublished: boolean;
  comments: { user: string; comment: string }[] | [];
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogReq extends IMessage {
  blog: IBlogData;
}

export interface IBlog extends IMessage {
  data: IBlogData;
}

export interface IBlogs extends IMessage {
  data: IBlogData[];
  count: number;
}

export interface IGenre extends IMessage {
  data: string[];
}

export interface IComments extends IMessage {
  data: {
    user: {
      _id: IUserData['_id'];
      fullname: IUserData['fullname'];
      image: IUserData['image'];
    };
  }[];
  count: number;
}

export interface IPostBlog extends BlogKeys {
  title: string;
  content: string;
  genre: string[];
}
