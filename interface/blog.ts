import { Document, Types } from 'mongoose';
import { IBlogSchema, ICommentSchema } from './schema';
import IMessage from './message';

type BlogKeys = Record<string, string | string[]>;

export type IBlogData = Omit<
  Document<unknown, any, IBlogSchema> & IBlogSchema & { _id: Types.ObjectId & string },
  never
>;

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
  data: Omit<
    Document<unknown, any, ICommentSchema> & ICommentSchema & { _id: Types.ObjectId & string },
    never
  >[];
  commentsCount: number;
  count: number;
}

export interface IPostBlog extends BlogKeys {
  title: string;
  content: string;
  genre: string[];
}
