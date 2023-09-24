import axios from '.';
import { type Notification } from 'interface/models';
import { IQueryParamaters } from 'interface';

export const getNotifications = async ({
  page = 1,
  size = 20,
}: IQueryParamaters): Promise<{
  result: Notification[];
  currentPage: number;
  totalPage: number;
  count: number;
  read: number;
  unread: number;
}> => {
  const res = await axios.get(`/notification/?page=${page}&size=${size}`);

  return res.data;
};

export const markAsRead: Put<string> = async (id) => {
  const res = await axios.put(`/notification/${id}/mark-as-read`);

  return res.data;
};

export const markAllAsRead: Put<undefined> = async () => {
  const res = await axios.put(`/notification/mark-all-as-read`);

  return res.data;
};
