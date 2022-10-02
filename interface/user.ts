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

export interface IUserData {
  _id: string;
  fullname: string;
  email: string;
  dateOfBirth: Date;
  image: string | null;
  imageName: string | null;
  bookmarks: string[] | [];
  blogs: string[] | [];
  bio: string | null;
  website: string | null;
  following: string[] | [];
  followers: string[] | [];
  followingCount: number;
  followerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends IMessage {
  user: IUserData;
}

export interface IAuth {
  auth: IUserData;
}
