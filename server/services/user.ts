import { User } from 'server/models/user';
import { IUserRepository, IUserService } from 'server/ports/user';
import { FilterProps } from 'server/utils/types';

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getFollowers(
    userId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[User[], number]> {
    return await this.userRepository
      .findAllUsers({})
      .followedBy(userId, filter.search)
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .executeWithSession(sessionId);
  }

  async getFollowing(
    userId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[User[], number]> {
    return await this.userRepository
      .findAllUsers({})
      .following(userId, filter.search)
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .executeWithSession(sessionId);
  }
}
