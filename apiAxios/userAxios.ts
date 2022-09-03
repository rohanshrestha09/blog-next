import axios, { AxiosResponse } from 'axios';
import IMessage from '../interface/message';
import { ILogin, IToken, IUser } from '../interface/user';

class User {
  readonly cookie;

  constructor(cookie?: any) {
    this.cookie = cookie;
  }

  axiosFn = async (
    method: string,
    url: string,
    data?: any
  ): Promise<IUser & IToken & ILogin & IUser['user'] & IMessage> => {
    const res: AxiosResponse = await axios({
      method,
      url: `http://localhost:3000/api/user/${url}`,
      data,
      headers: { cookie: this.cookie },
      withCredentials: true,
    });

    return res.data;
  };

  auth = async (): Promise<IUser> => await this.axiosFn('get', 'auth');

  register = async (data: FormData): Promise<IToken> =>
    await this.axiosFn('post', 'register', data);

  login = async (data: ILogin): Promise<IToken> => await this.axiosFn('post', 'login', data);

  logout = async (): Promise<IMessage> => await this.axiosFn('delete', 'logout');

  getUser = async (id: string): Promise<IUser['user'] & IMessage> => await this.axiosFn('get', id);

  updateUser = async (data: FormData): Promise<IMessage> => await this.axiosFn('put', '', data);

  deleteUser = async (data: FormData): Promise<IMessage> => await this.axiosFn('delete', '', data);

  deleteUserImage = async (): Promise<IMessage> => await this.axiosFn('delete', 'image');

  followUser = async ({
    id,
    shouldFollow,
  }: {
    id: string;
    shouldFollow: boolean;
  }): Promise<IMessage> =>
    await this.axiosFn(`${shouldFollow ? 'post' : 'delete'}`, `${id}/follow`);
}

export default User;
