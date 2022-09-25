import axios, { AxiosResponse } from 'axios';
import { IBlogs, IBookmarks, ILiked } from '../interface/blog';
import IMessage from '../interface/message';
import { IAuth, IUserData } from '../interface/user';

class Auth {
  private readonly cookie;

  constructor(cookie?: any) {
    this.cookie = cookie;
  }

  axiosFn = async (
    method: string,
    url: string,
    data?: any
  ): Promise<IAuth & IUserData & IBlogs & IBookmarks & ILiked & IMessage> => {
    const res: AxiosResponse = await axios({
      method,
      url: `http://localhost:3000/api/auth/${url}`,
      data,
      headers: { Cookie: this.cookie },
      withCredentials: true,
    });

    return res.data;
  };

  auth = async (): Promise<IUserData> => await (await this.axiosFn('get', '')).auth;

  logout = async (): Promise<IMessage> => await this.axiosFn('delete', 'logout');

  updateUser = async (data: FormData): Promise<IMessage> => await this.axiosFn('put', '', data);

  deleteUser = async (data: FormData): Promise<IMessage> => await this.axiosFn('delete', '', data);

  deleteUserImage = async (): Promise<IMessage> => await this.axiosFn('delete', 'image');

  getAllBlogs = async ({
    sort,
    pageSize,
    genre,
    isPublished,
  }: {
    sort?: string;
    pageSize: number;
    genre?: string[] | [];
    isPublished?: boolean;
  }): Promise<IBlogs['blogs']> =>
    await (
      await this.axiosFn(
        'get',
        `blog?genre=${genre || ''}&sort=${sort || ''}&pageSize=${pageSize}&isPublished=${
          typeof isPublished === 'boolean' ? isPublished : ''
        }`
      )
    ).blogs;

  getBookmarkedBlogs = async ({
    sort,
    pageSize,
    genre,
  }: {
    sort?: string;
    pageSize: number;
    genre?: string[] | [];
  }): Promise<IBookmarks> =>
    await this.axiosFn(
      'get',
      `blog/bookmark?genre=${genre || ''}&sort=${sort || ''}&pageSize=${pageSize}`
    );

  getLikedBlogs = async ({
    sort,
    pageSize,
    genre,
  }: {
    sort?: string;
    pageSize: number;
    genre?: string[] | [];
  }): Promise<ILiked> =>
    await this.axiosFn(
      'get',
      `blog/liked?genre=${genre || ''}&sort=${sort || ''}&pageSize=${pageSize}`
    );

  followUser = async ({
    id,
    shouldFollow,
  }: {
    id: string;
    shouldFollow: boolean;
  }): Promise<IMessage> =>
    await this.axiosFn(`${shouldFollow ? 'post' : 'delete'}`, `${id}/follow`);
}

export default Auth;
