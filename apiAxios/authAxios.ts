import axios, { AxiosResponse } from 'axios';
import { SORT_TYPE, SORT_ORDER } from '../constants/reduxKeys';
import { IBlogs } from '../interface/blog';
import { IAuth, IUsers, IUserData } from '../interface/user';
import IMessage from '../interface/message';

const { LIKES } = SORT_TYPE;

const { ASCENDING } = SORT_ORDER;

class Auth {
  constructor(private cookie?: any) {}

  axiosFn = async (
    method: string,
    url: string,
    data?: any
  ): Promise<IAuth & IUserData & IBlogs & IUsers & IMessage> => {
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
    sortOrder,
    isPublished,
    search,
  }: {
    sort?: SORT_TYPE;
    pageSize?: number;
    genre?: string[] | [];
    sortOrder?: SORT_ORDER;
    isPublished?: boolean;
    search?: string;
  }): Promise<IBlogs> =>
    await this.axiosFn(
      'get',
      `blog?genre=${genre || ''}&sort=${sort || LIKES}&pageSize=${pageSize || 20}&sortOrder=${
        sortOrder || ASCENDING
      }&isPublished=${typeof isPublished === 'boolean' ? isPublished : ''}&search=${search || ''}`
    );

  getBookmarks = async ({
    pageSize,
    genre,
    search,
  }: {
    pageSize?: number;
    genre?: string[] | [];
    search?: string;
  }): Promise<IBlogs> =>
    await this.axiosFn(
      'get',
      `blog/bookmarks?genre=${genre || ''}&pageSize=${pageSize || 20}&search=${search || ''}`
    );

  getFollowers = async ({
    pageSize,
    search,
  }: {
    pageSize?: number;
    search?: string;
  }): Promise<IUsers> =>
    await this.axiosFn('get', `followers?pageSize=${pageSize || 20}&search=${search || ''}`);

  getFollowing = async ({
    pageSize,
    search,
  }: {
    pageSize?: number;
    search?: string;
  }): Promise<IUsers> =>
    await this.axiosFn('get', `following?pageSize=${pageSize || 20}&search=${search || ''}`);

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
