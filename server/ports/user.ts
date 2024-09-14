import { User, UserCreate, UserQuery, UserUpdate } from 'server/models/user';
import { QueryBuilder } from 'server/helpers/query-builder';
import { FilterProps } from 'server/utils/types';
import { Blog } from 'server/models/blog';

export interface IUserQueryBuilder extends QueryBuilder<User> {
  following(userId: string, search?: string): IUserQueryBuilder;
  followedBy(userId: string, search?: string): IUserQueryBuilder;
}

export interface IUserRepository {
  findUserByID(id: string, sessionId?: string): Promise<User>;
  findUserByEmail(email: string, sessionId?: string): Promise<User>;
  findUserPasswordByEmail(email: string): Promise<string>;
  findAllUsers(options: UserQuery): IUserQueryBuilder;
  findRandomUsers(options: UserQuery, size: number): Promise<IUserQueryBuilder>;
  createUser(data: UserCreate): Promise<User>;
  updateUserByID(id: string, data: UserUpdate): Promise<void>;
  deleteUserByID(id: string, returning?: Partial<Record<keyof User, boolean>>): Promise<User>;
  addFollower(id: string, followerId: string): Promise<void>;
  removeFollower(id: string, followerId: string): Promise<void>;
}

export interface IUserService {
  getUser(userId: string, sessionId?: string): Promise<User>;
  getFollowers(userId: string, filter: FilterProps, sessionId?: string): Promise<[User[], number]>;
  getFollowing(userId: string, filter: FilterProps, sessionId?: string): Promise<[User[], number]>;
  getUserSuggestions(filter: FilterProps, sessionId?: string): Promise<[User[], number]>;
  getUserBlogs(userId: string, filter: FilterProps, sessionId?: string): Promise<[Blog[], number]>;
  followUser(user: User, followingId: string): Promise<void>;
  unfollowUser(user: User, followingId: string): Promise<void>;
}
