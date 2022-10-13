import axios, { AxiosResponse } from 'axios';
import { IBlogs } from '../interface/blog';
import { ILogin, IToken, IUser } from '../interface/user';

class User {
  constructor(private cookie?: any) {}

  axiosFn = async (
    method: string,
    url: string,
    data?: any
  ): Promise<IUser & IToken & ILogin & IBlogs> => {
    const res: AxiosResponse = await axios({
      method,
      url: `http://localhost:3000/api/user/${url}`,
      data,
      headers: { Cookie: this.cookie },
      withCredentials: true,
    });

    return res.data;
  };

  register = async (data: FormData): Promise<IToken> =>
    await this.axiosFn('post', 'register', data);

  login = async (data: ILogin): Promise<IToken> => await this.axiosFn('post', 'login', data);

  getUser = async (id: string): Promise<IUser['user']> =>
    await (
      await this.axiosFn('get', id)
    ).user;

  getUserBlogs = async ({ user, pageSize }: { user: string; pageSize?: number }): Promise<IBlogs> =>
    await this.axiosFn('get', `${user}/blog?pageSize=${pageSize || 20}`);
}

export default User;
