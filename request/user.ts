import axios from '.';
import { Blog } from 'models/blog';
import { User } from 'models/user';
import { IQueryParamaters } from 'utils/types';

export const getUser: Get<string, User> = async (id, config) => {
  const res = await axios.get(`/user/${id}`, config);

  return res.data?.data;
};

export const followUser: Post<string> = async (id) => {
  const res = await axios.post(`/user/${id}/follow`);

  return res.data;
};

export const unfollowUser: Delete<string> = async (id) => {
  const res = await axios.delete(`/user/${id}/follow`);

  return res.data;
};

export const getUserBlogs: GetAll<IQueryParamaters & Pick<User, 'id'>, Blog> = async (
  { id, page = 1, size = 20 },
  config,
) => {
  const res = await axios.get(`/user/${id}/blog?page=${page}&size=${size}`, config);

  return res.data;
};

export const getUserFollowing: GetAll<IQueryParamaters & Pick<User, 'id'>, User> = async (
  { id, page = 1, size = 20, search = '' },
  config,
) => {
  const res = await axios.get(
    `/user/${id}/following?page=${page}&size=${size}&search=${search}`,
    config,
  );

  return res.data;
};

export const getUserFollowers: GetAll<IQueryParamaters & Pick<User, 'id'>, User> = async (
  { id, page = 1, size = 20, search = '' },
  config,
) => {
  const res = await axios.get(
    `/user/${id}/follower?page=${page}&size=${size}&search=${search}`,
    config,
  );

  return res.data;
};

export const getUserSuggestions: GetAll<IQueryParamaters, User> = async (
  { page = 1, size = 20, search = '' },
  config,
) => {
  const res = await axios.get(
    `/user/suggestion?page=${page}&size=${size}&search=${search}`,
    config,
  );

  return res.data;
};
