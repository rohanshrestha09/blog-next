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

    logout: async (): Promise<IMessage> => await axiosFn('delete', 'logout'),

    updateUser: async (data: FormData): Promise<IMessage> => await axiosFn('put', '', data),

    deleteUser: async (data: FormData): Promise<IMessage> => await axiosFn('delete', '', data),

    deleteUserImage: async (): Promise<IMessage> => await axiosFn('delete', 'image'),

    getAllBlogs: async ({
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
      await axiosFn(
        'get',
        `blog?genre=${genre || []}&sort=${sort || 'likesCount'}&pageSize=${
          pageSize || 20
        }&sortOrder=${sortOrder || 'desc'}&isPublished=${
          typeof isPublished === 'boolean' ? isPublished : ''
        }&search=${search || ''}`
      ),

    getBookmarks: async ({
      pageSize,
      genre,
      search,
    }: {
      pageSize?: number;
      genre?: string[] | [];
      search?: string;
    }): Promise<IBlogs> =>
      await axiosFn(
        'get',
        `blog/bookmarks?genre=${genre || []}&pageSize=${pageSize || 20}&search=${search || ''}`
      ),

    getFollowingBlogs: async ({ pageSize }: { pageSize?: number }): Promise<IBlogs> =>
      await axiosFn('get', `blog/following?pageSize=${pageSize || 20}`),

    getFollowers: async ({
      pageSize,
      search,
    }: {
      pageSize?: number;
      search?: string;
    }): Promise<IUsers> =>
      await axiosFn('get', `followers?pageSize=${pageSize || 20}&search=${search || ''}`),

    getFollowing: async ({
      pageSize,
      search,
    }: {
      pageSize?: number;
      search?: string;
    }): Promise<IUsers> =>
      await axiosFn('get', `following?pageSize=${pageSize || 20}&search=${search || ''}`),

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
