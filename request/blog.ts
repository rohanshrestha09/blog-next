import { AxiosRequestConfig } from 'axios';
import axios from '.';
import { type User, type Blog, type Comment, type Genre } from 'interface/models';
import { IQueryParamaters } from 'interface';
import { SORT_ORDER, SORT_TYPE } from 'constants/reduxKeys';

export const getBlog: Get<string, Blog> = async (id, config) => {
  const res = await axios.get(`/blog/${id}`, config);

  return res.data?.data;
};

export const getAllBlogs: GetAll<
  IQueryParamaters & Partial<Pick<Blog, 'genre' | 'isPublished'>> & { search?: string },
  Blog
> = async (
  {
    page = 1,
    size = 20,
    sort = SORT_TYPE.LIKE_COUNT,
    order = SORT_ORDER.DESCENDING,
    genre = '',
    search = '',
  },
  config,
) => {
  const res = await axios.get(
    `/blog?page=${page}&size=${size}&sort=${sort}&order=${order}&genre=${genre}&search=${search}`,
    config,
  );

  return res.data?.data;
};

export const getBlogSuggestions: GetAll<IQueryParamaters, Blog> = async (
  { page = 1, size = 4 },
  config,
) => {
  const res = await axios.get(`/blog/suggestions?page=${page}&size=${size}`, config);

  return res.data?.data;
};

export const createBlog = async (
  data: FormData,
): Promise<{ data: { slug: string }; message: string }> => {
  const res = await axios.post('/blog', data);

  return res.data;
};

export const updateBlog = async ({
  slug,
  data,
}: Pick<Blog, 'slug'> & { data: FormData }): Promise<{
  data: { slug: string };
  message: string;
}> => {
  const res = await axios.put(`/blog/${slug}`, data);

  return res.data;
};

export const deleteBlog: Delete<string> = async (slug) => {
  const res = await axios.delete(`/blog/${slug}`);

  return res.data;
};

export const publishBlog: Post<string> = async (slug) => {
  const res = await axios.post(`/blog/${slug}/publish`);

  return res.data;
};

export const unpublishBlog: Delete<string> = async (slug) => {
  const res = await axios.delete(`/blog/${slug}/publish`);

  return res.data;
};

export const getLikes: GetAll<IQueryParamaters & Pick<Blog, 'slug'>, User> = async (
  { slug, page = 1, size = 20 },
  config,
) => {
  const res = await axios.get(`/blog/${slug}/like?page=${page}&size=${size}`, config);

  return res.data?.data;
};

export const likeBlog: Post<string> = async (slug) => {
  const res = await axios.post(`/blog/${slug}/like`);

  return res.data;
};

export const unlikeBlog: Delete<string> = async (slug) => {
  const res = await axios.delete(`/blog/${slug}/like`);

  return res.data;
};

export const bookmarkBlog: Post<string> = async (slug) => {
  const res = await axios.post(`/blog/${slug}/bookmark`);

  return res.data;
};

export const unbookmarkBlog: Delete<string> = async (slug) => {
  const res = await axios.delete(`/blog/${slug}/bookmark`);

  return res.data;
};

export const getComments: GetAll<IQueryParamaters & Pick<Blog, 'slug'>, Comment> = async (
  { slug, page = 1, size = 20 },
  config,
) => {
  const res = await axios.get(`/blog/${slug}/comment?page=${page}&size=${size}`, config);

  return res.data?.data;
};

export const createComment: Post<Pick<Blog, 'slug'> & { data: Pick<Comment, 'content'> }> = async ({
  slug,
  data,
}) => {
  const res = await axios.post(`/blog/${slug}/comment`, data);

  return res.data;
};

export const deleteComment: Delete<{ slug: string; commentId: number }> = async ({
  slug,
  commentId,
}) => {
  const res = await axios.delete(`/blog/${slug}/comment/${commentId}`);

  return res.data;
};

export const likeComment: Post<{ slug: string; commentId: number }> = async ({
  slug,
  commentId,
}) => {
  const res = await axios.post(`/blog/${slug}/comment/${commentId}/like`);

  return res.data;
};

export const unlikeComment: Delete<{ slug: string; commentId: number }> = async ({
  slug,
  commentId,
}) => {
  const res = await axios.delete(`/blog/${slug}/comment/${commentId}/like`);

  return res.data;
};

export const getGenre: Get<AxiosRequestConfig, Record<Genre, Genre>> = async (config) => {
  const res = await axios.get('/blog/genre', config);

  return res.data?.data;
};
