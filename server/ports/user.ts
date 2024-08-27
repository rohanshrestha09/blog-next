import { User, UserCreate, UserUpdate } from 'server/models/user';
import { QueryBuilder } from 'server/helpers/query-builder';
import { FilterProps } from 'server/utils/types';

export interface IUserQueryBuilder extends QueryBuilder<User> {
  following(userId: string, search?: string): IUserQueryBuilder;
  followedBy(userId: string, search?: string): IUserQueryBuilder;
}

export interface IUserRepository {
  findUserByID(id: string): Promise<User>;
  findUserByEmail(email: string): Promise<User>;
  findUserPasswordByEmail(email: string): Promise<string>;
  findAllUsers(options: Partial<User>): IUserQueryBuilder;
  createUser(data: UserCreate): Promise<User>;
  updateUserByID(id: string, data: UserUpdate): Promise<void>;
  deleteUserByID(id: string, returning?: Partial<Record<keyof User, boolean>>): Promise<User>;
}

export interface IUserService {
  getFollowers(userId: string, filter: FilterProps, sessionId?: string): Promise<[User[], number]>;
  getFollowing(userId: string, filter: FilterProps, sessionId?: string): Promise<[User[], number]>;
}
