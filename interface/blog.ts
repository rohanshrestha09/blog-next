import IMessage from './message';
import { IUserData } from './user';

type BlogKeys = Record<string, string | string[]>;

export interface IBlogData extends IMessage {
  _id: string;
  author: IUserData;
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
  comments: { commenter: string; comment: string }[] | [];
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlog extends IMessage {
  blog: IBlogData;
}

export interface IBlogs extends IMessage {
  blogs: IBlogData[];
}

export interface IBookmarks extends IMessage {
  bookmarks: IBlogData[];
}

export interface IGetGenre extends IMessage {
  genre: string[];
}

export interface IPostBlog extends BlogKeys {
  title: string;
  content: string;
  genre: string[];
}
