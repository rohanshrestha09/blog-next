import axios from '.';
import { type Blog, type User } from 'interface/models';
import { IQueryParamaters } from 'interface';

export const getUser: Get<string, User> = async (id) => {
  const res = await axios.get(`/user/${id}`);

  return res.data;
};

export const followUser: Post<string> = async (id) => {
  const res = await axios.post(`/user/${id}/follow`);

  return res.data;
};

export const unfollowUser: Delete<string> = async (id) => {
  const res = await axios.delete(`/user/${id}/follow`);

  return res.data;
};

export const getUserBlogs: GetAll<IQueryParamaters & Pick<User, 'id'>, Blog> = async ({
  id,
  page = 1,
  size = 20,
}) => {
  const res = await axios.get(`/user/${id}?page=${page}&size=${size}`);

  return res.data;
};

export const getUserFollowing: GetAll<
  IQueryParamaters & Pick<User, 'id'> & { search?: string },
  User
> = async ({ id, page = 1, size = 20, search = '' }) => {
  const res = await axios.get(`/user/${id}/following?page=${page}&size=${size}&search=${search}`);

  return res.data;
};

export const getUserFollowers: GetAll<
  IQueryParamaters & Pick<User, 'id'> & { search?: string },
  User
> = async ({ id, page = 1, size = 20, search = '' }) => {
  const res = await axios.get(`/user/${id}/followers?page=${page}&size=${size}&search=${search}`);

  return res.data;
};

export const getUserSuggestions: GetAll<IQueryParamaters & { search?: string }, User> = async ({
  page = 1,
  size = 20,
  search = '',
}) => {
  const res = await axios.get(`/user/suggestions?page=${page}&size=${size}&search=${search}`);

  return res.data;
};