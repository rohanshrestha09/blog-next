import axios, { AxiosResponse } from 'axios';
import { User } from 'firebase/auth';
import { IBlogs } from '../interface/blog';
import { ILogin, IToken, IUserData, IUser, IUsers } from '../interface/user';

const UserAxios = (cookie?: any) => {
  const axiosFn = async (
    method: string,
    url: string,
    data?: any
  ): Promise<IUser & IToken & ILogin & IBlogs & IUsers> => {
    const res: AxiosResponse = await axios({
      method,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/${url}`,
      data,
      headers: { Cookie: cookie || '' },
      withCredentials: true,
    });

    return res.data;
  };

  return {
    register: async (data: FormData): Promise<IToken> => await axiosFn('post', 'register', data),

    login: async (data: ILogin): Promise<IToken> => await axiosFn('post', 'login', data),

    googleSignIn: async (data: User): Promise<IToken> =>
      await axiosFn('post', 'login/google', data),

    getUser: async (id: string): Promise<IUserData> => await (await axiosFn('get', id)).data,

    getUserBlogs: async ({
      user,
      pageSize,
    }: {
      user: string;
      pageSize?: number;
    }): Promise<IBlogs> => await axiosFn('get', `${user}/blog?pageSize=${pageSize || 20}`),

    getUserFollowers: async ({
      user,
      pageSize,
      search,
    }: {
      user: string;
      pageSize?: number;
      search?: string;
    }): Promise<IUsers> =>
      await axiosFn('get', `${user}/followers?pageSize=${pageSize || 20}&search=${search || ''}`),

    getUserFollowing: async ({
      user,
      pageSize,
      search,
    }: {
      user: string;
      pageSize?: number;
      search?: string;
    }): Promise<IUsers> =>
      await axiosFn('get', `${user}/following?pageSize=${pageSize || 20}&search=${search || ''}`),

    getUserSuggestions: async ({
      pageSize,
      search,
    }: {
      pageSize?: number;
      search?: string;
    }): Promise<IUsers> =>
      await axiosFn('get', `suggestions?pageSize=${pageSize || 20}&search=${search || ''}`),
  };
};

export default UserAxios;
