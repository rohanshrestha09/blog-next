import { AxiosRequestConfig } from 'axios';
import axios from '.';
import { Blog } from 'models/blog';
import { User } from 'models/user';
import { IQueryParamaters } from 'utils/types';
import { SORT_TYPE, SORT_ORDER } from 'constants/reduxKeys';

export const register: Post<FormData> = async (data) => {
  const res = await axios.post('/auth/register', data);

  return res.data;
};

export const login: Post<Pick<User, 'email'> & { password: string }> = async (data) => {
  const res = await axios.post('/auth/login', data);

  return res.data;
};

export const changePassword: Post<{ oldPassword: string; newPassword: string }> = async (data) => {
  const res = await axios.post('/auth/change-password', data);

  return res.data;
};

export const getProfile: Get<AxiosRequestConfig | undefined, User> = async (config) => {
  const res = await axios.get('/auth/profile', config);

  return res.data?.data;
};

export const completeProfile: Put<{ password: string; confirmPassword: string }> = async (data) => {
  const res = await axios.put('/auth/complete-profile', data);

  return res.data;
};

export const logout: Delete<undefined> = async () => {
  const res = await axios.delete('/auth/logout');

  return res.data;
};

export const updateProfile: Put<FormData> = async (data) => {
  const res = await axios.put('/auth/profile', data);

  return res.data;
};

export const deleteProfile: Delete<FormData> = async (data) => {
  const res = await axios.request({
    method: 'delete',
    url: '/auth/profile',
    data,
  });

  return res.data;
};

export const deleteProfileImage: Delete<unknown> = async () => {
  const res = await axios.delete('/auth/profile/image');

  return res.data;
};

export const getBlogs: GetAll<
  IQueryParamaters & Partial<Pick<Blog, 'genre' | 'isPublished'>>,
  Blog
> = async (
  {
    page = 1,
    size = 20,
    sort = SORT_TYPE.LIKE_COUNT,
    order = SORT_ORDER.DESC,
    genre = '',
    isPublished = '',
    search = '',
  },
  config,
) => {
  const res = await axios.get(
    `/auth/blog?page=${page}&size=${size}&sort=${sort}&order=${order}&genre=${genre}&isPublished=${isPublished}&search=${search}`,
    config,
  );

  return res.data;
};

export const getBookmarks: GetAll<IQueryParamaters & Partial<Pick<Blog, 'genre'>>, Blog> = async (
  { page = 1, size = 20, genre = '', search = '' },
  config,
) => {
  const res = await axios.get(
    `/auth/blog/bookmark?page=${page}&size=${size}&genre=${genre}&search=${search}`,
    config,
  );

  return res.data;
};

export const getFollowingBlogs: GetAll<IQueryParamaters, Blog> = async (
  { page = 1, size = 20 },
  config,
) => {
  const res = await axios.get(`/auth/blog/following?page=${page}&size=${size}`, config);

  return res.data;
};

export const getFollowers: GetAll<IQueryParamaters, User> = async (
  { page = 1, size = 20, search = '' },
  config,
) => {
  const res = await axios.get(`/auth/follower?page=${page}&size=${size}&search=${search}`, config);

  return res.data;
};

export const getFollowing: GetAll<IQueryParamaters, User> = async (
  { page = 1, size = 20, search = '' },
  config,
) => {
  const res = await axios.get(`/auth/following?page=${page}&size=${size}&search=${search}`, config);

  return res.data;
};

export const sendPasswordResetMail: Post<Pick<User, 'email'>> = async (data) => {
  const res = await axios.post('/auth/reset-password', data);

  return res.data;
};

export const resetPassword: Post<{
  email: string;
  token: string;
  data: { password: string };
}> = async ({ email, token, data }) => {
  const res = await axios.post(`/auth/reset-password/${email}/${token}`, data);

  return res.data;
};
