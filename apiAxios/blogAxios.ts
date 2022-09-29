import axios, { AxiosResponse } from 'axios';
import { IBlog, IBlogData, IBlogs, IGetGenre } from '../interface/blog';
import IMessage from '../interface/message';

class Blog {
  private readonly cookie;

  constructor(cookie?: any) {
    this.cookie = cookie;
  }

  axiosFn = async (
    method: string,
    url: string,
    data?: any
  ): Promise<IGetGenre & IBlogData & IBlog & IBlogs & IMessage> => {
    const res: AxiosResponse = await axios({
      method,
      url: `http://localhost:3000/api/blog/${url}`,
      data,
      headers: { Cookie: this.cookie },
      withCredentials: true,
    });

    return res.data;
  };

  getBlog = async (id: string): Promise<IBlogData> => await (await this.axiosFn('get', id)).blog;

  getAllBlog = async ({
    sort,
    pageSize,
    genre,
  }: {
    sort: string;
    pageSize: number;
    genre: string[] | [];
  }): Promise<IBlogs> =>
    await this.axiosFn('get', `?genre=${genre}&sort=${sort}&pageSize=${pageSize}`);

  postBlog = async (data: FormData): Promise<IMessage> => await this.axiosFn('post', '', data);

  updateBlog = async ({ id, data }: { id: string; data: FormData }): Promise<IMessage> =>
    await this.axiosFn('put', id, data);

  deleteBlog = async (id: string): Promise<IMessage> => this.axiosFn('delete', id);

  publishBlog = async ({
    id,
    shouldPublish,
  }: {
    id: string;
    shouldPublish: boolean;
  }): Promise<IMessage> =>
    await this.axiosFn(`${shouldPublish ? 'post' : 'delete'}`, `${id}/publish`);

  likeBlog = async ({ id, shouldLike }: { id: string; shouldLike: boolean }): Promise<IMessage> =>
    await this.axiosFn(`${shouldLike ? 'post' : 'delete'}`, `${id}/like`);

  bookmarkBlog = async ({
    id,
    shouldBookmark,
  }: {
    id: string;
    shouldBookmark: boolean;
  }): Promise<IMessage> =>
    await this.axiosFn(`${shouldBookmark ? 'post' : 'delete'}`, `${id}/bookmark`);

  commentBlog = async ({
    id,
    shouldComment,
    data,
  }: {
    id: string;
    shouldComment: boolean;
    data: FormData;
  }): Promise<IMessage> =>
    await this.axiosFn(`${shouldComment ? 'post' : 'delete'}`, `${id}/comment`, data);

  getGenre = async (): Promise<IGetGenre['genre']> =>
    await (
      await this.axiosFn('get', 'genre')
    ).genre;
}

export default Blog;
