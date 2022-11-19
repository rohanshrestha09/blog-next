import axios, { AxiosResponse } from 'axios';
import IMessage from '../interface/message';

class Security {
  constructor(private cookie?: any) {}

  axiosFn = async (method: string, url: string, data?: any): Promise<IMessage> => {
    const res: AxiosResponse = await axios({
      method,
      url: `http://localhost:5000/api/security/${url}`,
      data,
      headers: { Cookie: this.cookie || '' },
      withCredentials: true,
    });

    return res.data;
  };

  getResetPasswordLink = async (data: { email: string }): Promise<IMessage> =>
    await this.axiosFn('get', 'reset-password', data);

  resetPassword = async ({
    id,
    token,
    data,
  }: {
    id: string;
    token: string;
    data: { password: string; confirmPassword: string };
  }): Promise<IMessage> => await this.axiosFn('post', `reset-password/${id}/${token}`, data);

  changePassword = async (data: {
    password: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<IMessage> => await this.axiosFn('post', 'change-password', data);
}

export default Security;
