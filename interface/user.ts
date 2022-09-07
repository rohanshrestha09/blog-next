import { IBlog } from './blog';
import IMessage from './message';

type RegisterKeys = Record<string, string | boolean>;

export interface IToken extends IMessage {
  token: string;
}

export interface IRegister extends RegisterKeys {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  remember: boolean;
}

export interface ILogin {
  email: string;
  password: string;
  remember: boolean;
}

export interface IUser extends IMessage {
  user: {
    _id: string;
    fullname: string;
    email: string;
    dateOfBirth: Date;
    image?: string;
    imageName?: string;
    bookmarks?: IBlog[];
    blogs?: IBlog[];
    liked?: IBlog[];
    bio?: string;
    following?: IUser['user'][];
    followers?: IUser['user'][];
    followingCount: number;
    followerCount: number;
    createdat: Date;
    updatedAt: Date;
  };
}

export interface IQueryUser {
  queryUser: IUser['user'];
}
