import { AxiosRequestConfig } from 'axios';
import { SORT_ORDER, SORT_TYPE } from 'constants/reduxKeys';
import { User } from '../models/user';

export interface IContext {
  authUser?: User;
}

export type TGetServerSidePropsReturnType = {
  props: object;
};

export interface IGetAll<T> {
  result: T[];
  currentPage: number;
  totalPage: number;
  count: number;
}

export interface IQueryParamaters {
  pagination?: boolean;
  page?: number;
  size?: number;
  sort?: SORT_TYPE;
  order?: SORT_ORDER;
  search?: string;
}

export interface IMessage {
  message: string;
}

declare global {
  type Get<T, V> = (args: T, config?: AxiosRequestConfig) => Promise<V>;

  type GetAll<T, V> = (args: T, config?: AxiosRequestConfig) => Promise<IGetAll<V>>;

  type Post<T> = (args: T) => Promise<IMessage>;

  type Put<T> = (args: T) => Promise<IMessage>;

  type Delete<T> = (args: T) => Promise<IMessage>;

  type Session = { userId?: string };
}
