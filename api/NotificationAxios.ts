import axios, { AxiosResponse } from 'axios';
import { INotifications } from '../interface/notification';

const NotificationAxios = (cookie?: any) => {
  const axiosFn = async (
    method: string,
    url: string,
    data?: any
  ): Promise<INotifications & IMessage> => {
    const res: AxiosResponse = await axios({
      method,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notification/${url}`,
      data,
      headers: { Cookie: cookie || '' },
      withCredentials: true,
    });

    return res.data;
  };

  return {
    getNotifications: async ({ size = 20 }: { size?: number }): Promise<INotifications> =>
      await axiosFn('get', `?size=${size}`),

    markAsRead: async (id: string): Promise<IMessage> => await axiosFn('put', id),

    markAllAsRead: async (): Promise<IMessage> => await axiosFn('put', ''),
  };
};

export default NotificationAxios;
