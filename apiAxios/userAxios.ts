import axios, { AxiosResponse } from 'axios';
import { IBlogs } from '../interface/blog';
import { ILogin, IToken, IUserData, IUser, IUsers } from '../interface/user';

class User {
  constructor(private cookie?: any) {}

  axiosFn = async (
    method: string,
    url: string,
    data?: any
  ): Promise<IUser & IToken & ILogin & IBlogs & IUsers> => {
    const res: AxiosResponse = await axios({
      method,
      url: `http://localhost:3000/api/user/${url}`,
      data,
      headers: { Cookie: this.cookie || '' },
      withCredentials: true,
    });

    return res.data;
  };

  register = async (data: FormData): Promise<IToken> =>
    await this.axiosFn('post', 'register', data);

  login = async (data: ILogin): Promise<IToken> => await this.axiosFn('post', 'login', data);

  getUser = async (id: string): Promise<IUserData> => await (await this.axiosFn('get', id)).data;

  getUserBlogs = async ({ user, pageSize }: { user: string; pageSize?: number }): Promise<IBlogs> =>
    await this.axiosFn('get', `${user}/blog?pageSize=${pageSize || 20}`);

  getUserFollowers = async ({
    user,
    pageSize,
    search,
  }: {
    user: string;
    pageSize?: number;
    search?: string;
  }): Promise<IUsers> =>
    await this.axiosFn(
      'get',
      `${user}/followers?pageSize=${pageSize || 20}&search=${search || ''}`
    );

  getUserFollowing = async ({
    user,
    pageSize,
    search,
  }: {
    user: string;
    pageSize?: number;
    search?: string;
  }): Promise<IUsers> =>
    await this.axiosFn(
      'get',
      `${user}/following?pageSize=${pageSize || 20}&search=${search || ''}`
    );

  getUserSuggestions = async ({ pageSize }: { pageSize: number }): Promise<IUsers> =>
    await this.axiosFn('get', `suggestions?pageSize=${pageSize || 20}`);
}

export default User;
