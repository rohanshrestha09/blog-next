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
      url: `https://blogsansar.vercel.app/api/auth/${url}`,
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
    sortOrder,
    isPublished,
  }: {
    sort?: string;
    pageSize?: number;
    genre?: string[] | [];
    sortOrder?: string;
    isPublished?: boolean;
  }): Promise<IBlogs['blogs']> =>
    await (
      await this.axiosFn(
        'get',
        `blog?genre=${genre || ''}&sort=${sort || ''}&pageSize=${pageSize || 20}&sortOrder=${
          sortOrder || 'asc'
        }&isPublished=${typeof isPublished === 'boolean' ? isPublished : ''}`
      )
    ).blogs;

  getBookmarkedBlogs = async ({
    sort,
    pageSize,
    genre,
    sortOrder,
  }: {
    sort?: string;
    pageSize?: number;
    genre?: string[] | [];
    sortOrder?: string;
  }): Promise<IBookmarks['bookmarks']> =>
    await (
      await this.axiosFn(
        'get',
        `blog/bookmark?genre=${genre || ''}&sort=${sort || ''}&sortOrder=${
          sortOrder || 'asc'
        }&pageSize=${pageSize || 20}`
      )
    ).bookmarks;

  getLikedBlogs = async ({
    sort,
    pageSize,
    genre,
    sortOrder,
  }: {
    sort?: string;
    pageSize?: number;
    genre?: string[] | [];
    sortOrder?: string;
  }): Promise<ILiked['liked']> =>
    await (
      await this.axiosFn(
        'get',
        `blog/liked?genre=${genre || ''}&sort=${sort || ''}&sortOrder=${
          sortOrder || 'asc'
        }&pageSize=${pageSize || 20}`
      )
    ).liked;

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
