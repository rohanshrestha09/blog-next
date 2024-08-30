import { NotificationController } from 'server/controllers/notification';
import { NotificationRepository } from 'server/repositories/notification';
import { NotificationService } from 'server/services/notification';

export function getNotificationRepository() {
  return new NotificationRepository();
}

export function getNotificationService() {
  const notificationRepository = getNotificationRepository();

  return new NotificationService(notificationRepository);
}

export function getNotificationController() {
  const notificationService = getNotificationService();

  return new NotificationController(notificationService);
}
