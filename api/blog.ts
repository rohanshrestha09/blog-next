import { AxiosResponse } from 'axios';
import axios from '../axios';
import { IGetGenre } from '../interface/blog';
import IMessage from '../interface/message';

export const getGenre = async (): Promise<IGetGenre['genre']> => {
  const res: AxiosResponse = await axios.get('http://localhost:5000/api/blog/genre');
  return res.data.genre;
};

export const postBlog = async (data: FormData): Promise<IMessage> => {
  const res: AxiosResponse = await axios.post('http://localhost:5000/api/blog', data);

  return res.data;
};
