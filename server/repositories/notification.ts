import { Prisma, PrismaClient } from '@prisma/client';
import {
  blogFields,
  commentFields,
  notificationFields,
  selectFields,
  userFields,
} from 'server/lib/prisma';
import {
  Notification,
  NotificationCreate,
  NotificationQuery,
  NotificationUpdate,
} from 'server/models/notification';
import { INotificationQueryBuilder, INotificationRepository } from 'server/ports/notification';

class NotificationQueryBuilder implements INotificationQueryBuilder {
  constructor(
    private readonly notificationInstance: PrismaClient['notification'],
    private readonly options: Prisma.NotificationFindManyArgs,
  ) {}

  withPagination(page: number, size: number) {
    this.options.skip = (page - 1) * (size || 20);

    this.options.take = size;

    return this;
  }

  withSort(sort: string, order: 'desc' | 'asc') {
    this.options.orderBy = {
      [sort]: order,
    };

    return this;
  }

  withSearch(search = '') {
    return this;
  }

  async execute(): Promise<[Notification[], number]> {
    const count = await this.notificationInstance.count({
      ...this.options,
      select: true,
      include: undefined as never,
    });

    const data = await this.notificationInstance.findMany({
      ...this.options,
      select: {
        ...notificationFields,
        sender: {
          select: selectFields(userFields, ['id', 'name', 'image']),
        },
        blog: {
          select: selectFields(blogFields, ['id', 'slug', 'title', 'image']),
        },
        comment: {
          select: selectFields(commentFields, ['id', 'content']),
        },
      },
    });

    return [data, count];
  }
}

export class NotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async notificationExists(options: NotificationQuery): Promise<boolean> {
    const notification = await this.prisma.notification.findFirst({ where: options });

    return !!notification;
  }

  findAllNotifications(options: NotificationQuery): INotificationQueryBuilder {
    return new NotificationQueryBuilder(this.prisma.notification, { where: options });
  }

  async createNotification(data: NotificationCreate): Promise<Notification> {
    return await this.prisma.notification.create({
      data,
      select: {
        ...notificationFields,
        sender: {
          select: selectFields(userFields, ['id', 'name', 'image']),
        },
        blog: {
          select: selectFields(blogFields, ['id', 'slug', 'title', 'image']),
        },
        comment: {
          select: selectFields(commentFields, ['id', 'content']),
        },
      },
    });
  }

  async updateNotifications(
    options: Pick<Notification, 'receiverId'>,
    data: NotificationUpdate,
  ): Promise<void> {
    await this.prisma.notification.updateMany({ where: options, data });
  }

  async updateNotification(
    options: Pick<Notification, 'id' | 'receiverId'>,
    data: NotificationUpdate,
  ): Promise<void> {
    await this.prisma.notification.update({ where: options, data });
  }

  async countNotifications(options: NotificationQuery): Promise<number> {
    return await this.prisma.notification.count({ where: options });
  }
}
