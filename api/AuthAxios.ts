import axios, { AxiosResponse } from 'axios';
import { SORT_TYPE, SORT_ORDER } from '../constants/reduxKeys';
import { IBlogs } from '../interface/blog';
import { IUsers, IUserData, IAuth } from '../interface/user';

const AuthAxios = (cookie?: any) => {
  const axiosFn = async (
    method: string,
    url: string,
    data?: any
  ): Promise<IAuth & IUserData & IBlogs & IUsers & IMessage> => {
    const res: AxiosResponse = await axios({
      method,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${url}`,
      data,
      headers: { Cookie: cookie || '' },
      withCredentials: true,
    });

    return res.data;
  };

  return {
    auth: async (): Promise<IUserData> => await (await axiosFn('get', '')).data,

    completeAuth: async (data: { password: string; confirmPassword: string }) =>
      await axiosFn('put', 'complete-auth', data),

    logout: async (): Promise<IMessage> => await axiosFn('delete', 'logout'),

    updateUser: async (data: FormData): Promise<IMessage> => await axiosFn('put', '', data),

    deleteUser: async (data: { password: string }): Promise<IMessage> =>
      await axiosFn('delete', '', data),

    deleteUserImage: async (): Promise<IMessage> => await axiosFn('delete', 'image'),

    getAllBlogs: async ({
      sort = SORT_TYPE.LIKE_COUNT,
      size = 20,
      genre = [],
      order = SORT_ORDER.DESCENDING,
      isPublished,
      search = '',
    }: {
      sort?: SORT_TYPE;
      size?: number;
      genre?: string[] | [];
      order?: SORT_ORDER;
      isPublished?: boolean;
      search?: string;
    }): Promise<IBlogs> =>
      await axiosFn(
        'get',
        `blog?genre=${genre}&sort=${sort}&size=${size}&order=${order}&isPublished=${
          typeof isPublished === 'boolean' ? isPublished : ''
        }&search=${search}`
      ),

    getBookmarks: async ({
      size = 20,
      genre = [],
      search = '',
    }: {
      size?: number;
      genre?: string[] | [];
      search?: string;
    }): Promise<IBlogs> =>
      await axiosFn('get', `blog/bookmarks?genre=${genre}&size=${size}&search=${search}`),

    getFollowingBlogs: async ({ size = 20 }: { size?: number }): Promise<IBlogs> =>
      await axiosFn('get', `blog/following?size=${size}`),

    getFollowers: async ({
      size = 20,
      search = '',
    }: {
      size?: number;
      search?: string;
    }): Promise<IUsers> => await axiosFn('get', `followers?size=${size}&search=${search}`),

    getFollowing: async ({
      size = 20,
      search = '',
    }: {
      size?: number;
      search?: string;
    }): Promise<IUsers> => await axiosFn('get', `following?size=${size}&search=${search}`),

    followUser: async ({
      id,
      shouldFollow,
    }: {
      id: string;
      shouldFollow: boolean;
    }): Promise<IMessage> => await axiosFn(`${shouldFollow ? 'post' : 'delete'}`, `${id}/follow`),
  };
};

export default AuthAxios;
