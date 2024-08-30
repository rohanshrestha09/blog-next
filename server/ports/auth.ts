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
  getUserBlogs(user: User, filter: FilterProps, isPublished?: boolean): Promise<[Blog[], number]>;
}
