import { Blog } from 'server/models/blog';
import { User } from 'server/models/user';
import { FilterProps, MultipartyFile } from 'server/utils/types';

export interface IAuthService {
  login(data: Pick<User, 'email' | 'password'>): Promise<string>;
  register(
    data: Pick<User, 'name' | 'email' | 'password' | 'dateOfBirth'>,
    file?: MultipartyFile,
  ): Promise<string>;
  completeProfile(user: User, data: Pick<User, 'password'>): Promise<void>;
  removeImage(user: User): Promise<void>;
  getProfile(user: User): Promise<User>;
  updateProfile(
    user: User,
    data: Partial<Pick<User, 'name' | 'bio' | 'website' | 'dateOfBirth'>>,
    file?: MultipartyFile,
  ): Promise<void>;
  deleteProfile(user: User, password: string): Promise<void>;
  getUserBlogs(
    user: User,
    options: Partial<Pick<Blog, 'genre' | 'isPublished'>>,
    filter: FilterProps,
  ): Promise<[Blog[], number]>;
  getBookmarkedBlogs(
    user: User,
    options: Partial<Pick<Blog, 'genre'>>,
    filter: FilterProps,
  ): Promise<[Blog[], number]>;
  getFollowingBlogs(user: User, filter: FilterProps): Promise<[Blog[], number]>;
  changePassword(user: User, data: { oldPassword: string; newPassword: string }): Promise<void>;
  sendPasswordResetMail(email: string): Promise<void>;
  resetPassword(token: string, data: Pick<User, 'email' | 'password'>): Promise<void>;
}
