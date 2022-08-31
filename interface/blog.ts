import IMessage from './message';

type BlogKeys = Record<string, string | string[]>;

export interface IBlog extends IMessage {
  blog: {
    author: string;
    image: string;
    imageName: string;
    title: string;
    content: string;
    genre: string[];
    likers?: string[];
    likes: number;
    viewers?: string[];
    views: number;
    isPublished: boolean;
    comments?: { commenter: string; comment: string }[];
    createdat: Date;
    updatedAt: Date;
  };
}

export interface IGetGenre extends IMessage {
  genre: string[];
}

export interface IPostBlog extends BlogKeys {
  title: string;
  content: string;
  genre: string[];
}
