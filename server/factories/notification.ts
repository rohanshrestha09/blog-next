import { NotificationController } from 'server/controllers/notification';
import { NotificationService } from 'server/services/notification';
import { getUnitOfWork } from './unitofwork';

export function getNotificationService() {
  const unitOfWork = getUnitOfWork();

  return new NotificationService(unitOfWork.notificationRepository);
}

export function getNotificationController() {
  const notificationService = getNotificationService();

  return new NotificationController(notificationService);
}
