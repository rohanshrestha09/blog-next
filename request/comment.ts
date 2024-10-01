import axios from '.';
import { Comment } from 'models/comment';

export const createComment: Post<Pick<Comment, 'blogId' | 'content'>> = async (data) => {
  const res = await axios.post(`/comment`, data);

  return res.data;
};

export const deleteComment: Delete<number> = async (commentId) => {
  const res = await axios.delete(`/comment/${commentId}`);

  return res.data;
};

export const likeComment: Post<number> = async (commentId) => {
  const res = await axios.post(`/comment/${commentId}/like`);

  return res.data;
};

export const unlikeComment: Delete<number> = async (commentId) => {
  const res = await axios.delete(`/comment/${commentId}/like`);

  return res.data;
};
