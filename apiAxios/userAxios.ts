import axios, { AxiosResponse } from 'axios';
import { IBlogs } from '../interface/blog';
import { ILogin, IToken, IUser } from '../interface/user';

class User {
  private readonly cookie;

  constructor(cookie?: any) {
    this.cookie = cookie;
  }

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

  getUser = async (id: string): Promise<IUser> => await this.axiosFn('get', id);

  getUserBlogs = async ({
    user,
    sort,
    pageSize,
    genre,
  }: {
    user: string;
    sort?: string;
    pageSize: number;
    genre?: string[] | [];
  }): Promise<IBlogs> =>
    await this.axiosFn(
      'get',
      `user/blog?user=${user}&genre=${genre || ''}sort=${sort || ''}&pageSize=${pageSize}`
    );
}

export default User;
