import { PrismaClient } from '@prisma/client';
import { IUnitOfWork } from 'server/ports/unitofwork';
import { IBlogRepository } from 'server/ports/blog';
import { IUserRepository } from 'server/ports/user';
import { ICommentRepository } from 'server/ports/comment';
import { INotificationRepository } from 'server/ports/notification';
import { BlogRepository } from './blog';
import { UserRepository } from './user';
import { CommentRepository } from './comment';
import { NotificationRepository } from './notification';

export class UnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  async beginTx<T>(fn: (tx: IUnitOfWork) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (prisma) => {
      const newUnitOfWork = new UnitOfWork(prisma as PrismaClient);
      return await fn(newUnitOfWork);
    });
  }

  get blogRepository(): IBlogRepository {
    return new BlogRepository(this.prisma);
  }

  get userRepository(): IUserRepository {
    return new UserRepository(this.prisma);
  }

  get commentRepository(): ICommentRepository {
    return new CommentRepository(this.prisma);
  }

  get notificationRepository(): INotificationRepository {
    return new NotificationRepository(this.prisma);
  }
}
