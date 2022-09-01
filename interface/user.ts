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

export interface IUserInfo extends IMessage {
  user: {
    _id: string;
    fullname: string;
    email: string;
    dateOfBirth: Date;
    image?: string;
    imageName?: string;
    bookmarks?: IBlog[];
    blogs?: IBlog[];
    bio?: string;
    following?: string[];
    followers?: string[];
    createdat: Date;
    updatedAt: Date;
  };
}
