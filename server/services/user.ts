import { User } from 'server/models/user';
import { Blog } from 'server/models/blog';
import { IBlogRepository } from 'server/ports/blog';
import { IUserRepository, IUserService } from 'server/ports/user';
import { FilterProps } from 'server/utils/types';
import { INotificationRepository, INotificationService } from 'server/ports/notification';
import { NotificationType } from 'server/enums/notification';

export class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly blogRepository: IBlogRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async getUser(userId: string, sessionId?: string): Promise<User> {
    return await this.userRepository.findUserByID(userId);
  }

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
      .execute(sessionId);
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
      .execute(sessionId);
  }

  async getUserSuggestions(filter: FilterProps, sessionId?: string): Promise<[User[], number]> {
    const builder = await this.userRepository.findRandomUsers({}, filter.size);

    return await builder
      .withPagination(filter.page, filter.size)
      .withSearch(filter.search)
      .execute(sessionId);
  }

  async getUserBlogs(
    userId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Blog[], number]> {
    return await this.blogRepository
      .findAllBlogs({ isPublished: true, authorId: userId })
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .withSearch(filter.search)
      .execute(sessionId);
  }

  async followUser(user: User, followingId: string): Promise<void> {
    await this.userRepository.addFollower(followingId, user.id);

    const notificationExists = await this.notificationRepository.notificationExists({
      type: NotificationType.FOLLOW_USER,
      senderId: user.id,
      receiverId: followingId,
    });

    if (!notificationExists) {
      const notification = await this.notificationRepository.createNotification({
        type: NotificationType.FOLLOW_USER,
        senderId: user.id,
        receiverId: followingId,
        description: `${user.name} followed you.`,
      });

      await this.notificationService.dispatchNotification(notification);
    }
  }

  async unfollowUser(user: User, followingId: string): Promise<void> {
    await this.userRepository.removeFollower(followingId, user.id);
  }
}
