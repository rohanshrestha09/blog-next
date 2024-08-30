import { NotificationStatus } from 'server/enums/notification';
import { pusher } from 'server/lib/pusher';
import { Notification } from 'server/models/notification';
import { INotificationRepository, INotificationService } from 'server/ports/notification';
import { FilterProps } from 'server/utils/types';

export class NotificationService implements INotificationService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async dispatchNotification(data: Notification): Promise<void> {
    await pusher.trigger(data.receiverId, 'dispatch-notification', data);
  }

  async markAllReceiverNotificationsAsRead(receiverId: string): Promise<void> {
    await this.notificationRepository.updateReceiverNotifications(
      { receiverId },
      { status: NotificationStatus.READ },
    );
  }

  async markReceiverNotificationAsRead(
    options: Pick<Notification, 'id' | 'receiverId'>,
  ): Promise<void> {
    await this.notificationRepository.updateReceiverNotification(options, {
      status: NotificationStatus.READ,
    });
  }

  async getReceiverNotifications(
    receiverId: string,
    filter: FilterProps,
  ): Promise<[Notification[], number]> {
    return await this.notificationRepository
      .findAllNotifications({ receiverId })
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .execute();
  }

  async getReceiverNotificationsCount(
    receiverId: string,
  ): Promise<{ read: number; unread: number }> {
    const read = await this.notificationRepository.countNotifications({
      status: NotificationStatus.READ,
      receiverId,
    });

    const unread = await this.notificationRepository.countNotifications({
      status: NotificationStatus.UNREAD,
      receiverId,
    });

    return { read, unread };
  }
}
