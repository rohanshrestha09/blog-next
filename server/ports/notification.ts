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
  updateReceiverNotifications(
    options: Pick<Notification, 'receiverId'>,
    data: NotificationUpdate,
  ): Promise<void>;
  updateReceiverNotification(
    options: Pick<Notification, 'id' | 'receiverId'>,
    data: NotificationUpdate,
  ): Promise<void>;
  countNotifications(options: NotificationQuery): Promise<number>;
}

export interface INotificationService {
  dispatchNotification(data: Notification): Promise<void>;
  markAllReceiverNotificationsAsRead(receiverId: string): Promise<void>;
  markReceiverNotificationAsRead(options: Pick<Notification, 'id' | 'receiverId'>): Promise<void>;
  getReceiverNotifications(
    receiverId: string,
    filter: FilterProps,
  ): Promise<[Notification[], number]>;
  getReceiverNotificationsCount(receiverId: string): Promise<{ read: number; unread: number }>;
}
