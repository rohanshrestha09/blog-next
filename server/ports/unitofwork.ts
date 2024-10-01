import { IBlogRepository } from './blog';
import { ICommentRepository } from './comment';
import { INotificationRepository } from './notification';
import { IUserRepository } from './user';

export interface IUnitOfWork {
  beginTx<T>(fn: (tx: IUnitOfWork) => Promise<T>): Promise<T>;
  blogRepository: IBlogRepository;
  userRepository: IUserRepository;
  commentRepository: ICommentRepository;
  notificationRepository: INotificationRepository;
}
