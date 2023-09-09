import axios from '.';
import { type Blog, type User } from 'interface/models';
import { IQueryParamaters } from 'interface';
import { SORT_TYPE, SORT_ORDER } from '../constants/reduxKeys';

export const register: Post<FormData> = async (data) => {
  const res = await axios.post('/auth/register', data);

  return res.data;
};

export const login: Post<Pick<User, 'email' | 'password'>> = async (data) => {
  const res = await axios.post('/auth/login', data);

  return res.data;
};

export const getProfile = async (): Promise<User> => {
  const res = await axios.get('/auth/profile');

  return res.data;
};

export const completeProfile: Put<{ password: string; confirmPassword: string }> = async (data) => {
  const res = await axios.put('/auth/complete-profile', data);

  return res.data;
};

export const logout: Put<undefined> = async () => {
  const res = await axios.put('/auth/logout');

  return res.data;
};

export const updateProfile: Put<FormData> = async (data) => {
  const res = await axios.put('/auth/profile', data);

  return res.data;
};

export const deleteProfile: Delete<Pick<User, 'password'>> = async (data) => {
  const res = await axios.request({
    method: 'delete',
    url: '/auth/profile',
    data,
  });

  return res.data;
};

export const deleteProfileImage: Delete<undefined> = async () => {
  const res = await axios.delete('/auth/profile/image');

  return res.data;
};

export const getAuthBlogs: GetAll<
  IQueryParamaters & Pick<Blog, 'title' | 'genre' | 'isPublished'>,
  Blog
> = async ({
  pagination = true,
  page = 1,
  size = 20,
  sort = SORT_TYPE.LIKE_COUNT,
  order = SORT_ORDER.DESCENDING,
  genre = '',
  isPublished = '',
  title = '',
}) => {
  const res = await axios.get(
    `/auth/blog?pagination=${pagination}&page=${page}&size=${size}&sort=${sort}&order=${order}&genre=${genre}&isPublished=${isPublished}&title=${title}`,
  );

  return res.data;
};

export const getBookmarks: GetAll<IQueryParamaters & Pick<Blog, 'title' | 'genre'>, Blog> = async ({
  pagination = true,
  page = 1,
  size = 20,
  genre = '',
  title = '',
}) => {
  const res = await axios.get(
    `/auth/blog/bookmarks?pagination=${pagination}&page=${page}&size=${size}&genre=${genre}&title=${title}`,
  );

  return res.data;
};

export const getFollowingBlogs: GetAll<IQueryParamaters, Blog> = async ({
  pagination = true,
  page = 1,
  size = 20,
}) => {
  const res = await axios.get(
    `/auth/blog/following?pagination=${pagination}&page=${page}&size=${size}`,
  );

  return res.data;
};

export const getFollowers: GetAll<IQueryParamaters & Pick<User, 'name'>, User> = async ({
  pagination = true,
  page = 1,
  size = 20,
  name = '',
}) => {
  const res = await axios.get(
    `/auth/followers?pagination=${pagination}&page=${page}&size=${size}&name=${name}`,
  );

  return res.data;
};

export const getFollowing: GetAll<IQueryParamaters & Pick<User, 'name'>, User> = async ({
  pagination = true,
  page = 1,
  size = 20,
  name = '',
}) => {
  const res = await axios.get(
    `/auth/following?pagination=${pagination}&page=${page}&size=${size}&name=${name}`,
  );

  return res.data;
};
