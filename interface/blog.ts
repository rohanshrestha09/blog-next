import IMessage from './message';

type BlogKeys = Record<string, string | string[]>;

export interface IBlogData extends IMessage {
  _id: string;
  author: string;
  authorName: string;
  authorImage: string | null;
  image: string;
  imageName: string;
  title: string;
  content: string;
  genre: string[];
  likers: string[] | [];
  likes: number;
  viewers: string[] | [];
  views: number;
  isPublished: boolean;
  comments: { commenter: string; comment: string }[] | [];
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

export interface ILiked extends IMessage {
  liked: IBlogData[];
}

export interface IGetGenre extends IMessage {
  genre: string[];
}

export interface IPostBlog extends BlogKeys {
  title: string;
  content: string;
  genre: string[];
}
