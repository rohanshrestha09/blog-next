import Joi from 'joi';
import { User } from 'server/models/user';

export type MultipartyFile = {
  path: string;
  headers: {
    ['content-type']: string;
  };
};

export type WithAuthRequest<T> = T & { authUser?: User };

export type FilterProps = {
  page: number;
  size: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
};
