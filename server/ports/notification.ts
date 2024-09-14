import {
  Notification,
  NotificationCreate,
  NotificationQuery,
  NotificationUpdate,
} from 'server/models/notification';
import { QueryBuilder } from 'server/helpers/query-builder';
import { FilterProps } from 'server/utils/types';

export interface INotificationQueryBuilder extends QueryBuilder<Notification> {}

export interface INotificationRepository {
  notificationExists(options: NotificationQuery): Promise<boolean>;
  findAllNotifications(options: NotificationQuery): INotificationQueryBuilder;
  createNotification(data: NotificationCreate): Promise<Notification>;
  updateNotifications(
    options: Pick<Notification, 'receiverId'>,
    data: NotificationUpdate,
  ): Promise<void>;
  updateNotification(
    options: Pick<Notification, 'id' | 'receiverId'>,
    data: NotificationUpdate,
  ): Promise<void>;
  countNotifications(options: NotificationQuery): Promise<number>;
}

export interface INotificationService {
  dispatchNotification(data: Notification): Promise<void>;
  markAllNotificationsAsRead(receiverId: string): Promise<void>;
  markNotificationAsRead(options: Pick<Notification, 'id' | 'receiverId'>): Promise<void>;
  getNotifications(receiverId: string, filter: FilterProps): Promise<[Notification[], number]>;
  getNotificationsCount(receiverId: string): Promise<{ read: number; unread: number }>;
}
