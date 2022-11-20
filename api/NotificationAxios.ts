import axios, { AxiosResponse } from 'axios';
import { INotifications } from '../interface/notification';
import IMessage from '../interface/message';

class Notification {
  constructor(private cookie?: any) {}

  axiosFn = async (method: string, url: string, data?: any): Promise<INotifications & IMessage> => {
    const res: AxiosResponse = await axios({
      method,
      url: `http://127.0.0.1:5000/api/notification/${url}`,
      data,
      headers: { Cookie: this.cookie || '' },
      withCredentials: true,
    });

    return res.data;
  };

  getNotifications = async ({ pageSize }: { pageSize?: number }): Promise<INotifications> =>
    await this.axiosFn('get', `?pageSize=${pageSize || 20}`);

  markAsRead = async (id: string): Promise<IMessage> => await this.axiosFn('put', id);

  markAllAsRead = async (): Promise<IMessage> => await this.axiosFn('put', '');
}

export default Notification;
