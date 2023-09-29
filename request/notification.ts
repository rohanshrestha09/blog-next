import { AxiosRequestConfig } from 'axios';
import axios from '.';
import { type Notification } from 'interface/models';
import { IQueryParamaters } from 'interface';

export const getNotifications = async (
  { page = 1, size = 20 }: IQueryParamaters,
  config?: AxiosRequestConfig,
): Promise<{
  result: Notification[];
  currentPage: number;
  totalPage: number;
  count: number;
  read: number;
  unread: number;
}> => {
  const res = await axios.get(`/notification/?page=${page}&size=${size}`, config);

  return res.data?.data;
};

export const markAsRead: Post<string> = async (id) => {
  const res = await axios.post(`/notification/${id}/mark-as-read`);

  return res.data;
};

export const markAllAsRead: Post<undefined> = async () => {
  const res = await axios.post(`/notification/mark-all-as-read`);

  return res.data;
};
