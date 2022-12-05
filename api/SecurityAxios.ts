import axios, { AxiosResponse } from 'axios';

class Security {
  constructor(private cookie?: any) {}

  axiosFn = async (method: string, url: string, data?: any): Promise<IMessage> => {
    const res: AxiosResponse = await axios({
      method,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/security/${url}`,
      data,
      headers: { Cookie: this.cookie || '' },
      withCredentials: true,
    });

    return res.data;
  };

  sendResetPasswordLink = async (data: { email: string }): Promise<IMessage> =>
    await this.axiosFn('post', 'reset-password', data);

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
