import axios, { AxiosResponse } from 'axios';
import { IGetGenre } from '../interface/blog';
import IMessage from '../interface/message';

class Blog {
  readonly cookie;
  constructor(cookie?: any) {
    this.cookie = cookie;
  }

  axiosFn = async (
    method: string,
    url: string,
    data?: any
  ): Promise<IGetGenre['genre'] & IMessage> => {
    const res: AxiosResponse = await axios({
      method,
      url: `http://localhost:3000/api/blog/${url}`,
      data,
      headers: { cookie: this.cookie },
      withCredentials: true,
    });

    return res.data;
  };

  getGenre = async (): Promise<IGetGenre['genre']> => await this.axiosFn('get', 'genre');

  postBlog = async (data: FormData): Promise<IMessage> => await this.axiosFn('post', '', data);
}

export default Blog;
