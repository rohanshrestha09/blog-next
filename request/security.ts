import axios from '.';
import { type User } from 'interface/models';

export const sendResetPasswordLink: Post<Pick<User, 'email'>> = async (data) => {
  const res = await axios.post('/security/reset-password', data);

  return res.data;
};

export const resetPassword: Post<{
  email: string;
  token: string;
  data: { password: string; confirmPassword: string };
}> = async ({ email, token, data }) => {
  const res = await axios.post(`/security/reset-password/${email}/${token}`, data);

  return res.data;
};

export const changePassword: Post<{ password: string; confirmPassword: string }> = async (data) => {
  const res = await axios.post('/security/change-password', data);

  return res.data;
};
