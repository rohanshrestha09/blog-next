import { AxiosResponse } from 'axios';
import axios from '../axios';
import { ILogin, IToken, IUserInfo } from '../interface/user';

export const auth = async (): Promise<IUserInfo> => {
  const res: AxiosResponse = await axios.get('http://localhost:5000/api/auth');

  return res.data;
};

export const register = async (data: FormData): Promise<IToken> => {
  const res: AxiosResponse = await axios.post('/api/user/register', data);

  return res.data;
};

export const login = async (data: ILogin): Promise<IToken> => {
  const res: AxiosResponse = await axios.post('http://localhost:5000/api/login', data);

  return res.data;
};
