import axios from '.';
import { type User, type Blog, type Comment, type Genre } from 'interface/models';
import { IQueryParamaters } from 'interface';
import { SORT_ORDER, SORT_TYPE } from 'constants/reduxKeys';

export const getBlog: Get<string, Blog> = async (id) => {
  const res = await axios.get(`/blog/${id}`);

  return res.data;
};

export const getAllBlogs: GetAll<
  IQueryParamaters & Pick<Blog, 'title' | 'genre' | 'isPublished'>,
  Blog
> = async ({
  pagination = true,
  page = 1,
  size = 20,
  sort = SORT_TYPE.LIKE_COUNT,
  order = SORT_ORDER.DESCENDING,
  genre = '',
  title = '',
}) => {
  const res = await axios.get(
    `/blog?pagination=${pagination}&page=${page}&size=${size}&sort=${sort}&order=${order}&genre=${genre}&title=${title}`,
  );

  return res.data;
};

export const getBlogSuggestions: GetAll<IQueryParamaters, Blog> = async ({
  pagination = true,
  page = 1,
  size = 4,
}) => {
  const res = await axios.get(
    `/blog/suggestions?pagination=${pagination}&page=${page}&size=${size}`,
  );

  return res.data;
};

export const createBlog: Post<FormData> = async (data) => {
  const res = await axios.post('/blog', data);

  return res.data;
};

export const updateBlog: Put<Pick<Blog, 'id'> & { data: FormData }> = async ({ id, data }) => {
  const res = await axios.put(`/blog/${id}`, data);

  return res.data;
};

export const deleteBlog: Delete<string> = async (id) => {
  const res = await axios.delete(`/blog/${id}`);

  return res.data;
};

export const publishBlog: Put<string> = async (id) => {
  const res = await axios.put(`/blog/${id}/publish`);

  return res.data;
};

export const unpublishBlog: Delete<string> = async (id) => {
  const res = await axios.delete(`/blog/${id}/publish`);

  return res.data;
};

export const getLikes: GetAll<IQueryParamaters & Pick<Blog, 'id'>, User> = async ({
  id,
  pagination = true,
  page = 1,
  size = 20,
}) => {
  const res = await axios.get(
    `/blog/${id}/like?pagination=${pagination}&page=${page}&size=${size}`,
  );

  return res.data;
};

export const likeBlog: Put<string> = async (id) => {
  const res = await axios.put(`/blog/${id}/like`);

  return res.data;
};

export const unlikeBlog: Delete<string> = async (id) => {
  const res = await axios.delete(`/blog/${id}/like`);

  return res.data;
};

export const bookmarkBlog: Put<string> = async (id) => {
  const res = await axios.put(`/blog/${id}/bookmark`);

  return res.data;
};

export const unbookmarkBlog: Delete<string> = async (id) => {
  const res = await axios.delete(`/blog/${id}/bookmark`);

  return res.data;
};

export const getComments: GetAll<IQueryParamaters & Pick<Blog, 'id'>, Comment> = async ({
  id,
  pagination = true,
  page = 1,
  size = 20,
}) => {
  const res = await axios.get(
    `/blog/${id}/comment?pagination=${pagination}&page=${page}&size=${size}`,
  );

  return res.data;
};

export const createComment: Post<Pick<Blog, 'id'> & { data: Pick<Comment, 'content'> }> = async ({
  id,
  data,
}) => {
  const res = await axios.post(`/blog/${id}/comment`, data);

  return res.data;
};

export const deleteComment: Delete<{ blogId: string; commentId: string }> = async ({
  blogId,
  commentId,
}) => {
  const res = await axios.delete(`/blog/${blogId}/comment/${commentId}`);

  return res.data;
};

export const likeComment: Post<{ blogId: string; commentId: string }> = async ({
  blogId,
  commentId,
}) => {
  const res = await axios.post(`/blog/${blogId}/comment/${commentId}/like`);

  return res.data;
};

export const unlikeComment: Delete<{ blogId: string; commentId: string }> = async ({
  blogId,
  commentId,
}) => {
  const res = await axios.delete(`/blog/${blogId}/comment/${commentId}/like`);

  return res.data;
};

export const getGenre: Get<undefined, Genre> = async () => {
  const res = await axios.get('/blog/genre');

  return res.data;
};
