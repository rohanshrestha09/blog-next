import { UserController } from 'server/controllers/user';
import { UserService } from 'server/services/user';
import { getNotificationService } from './notification';
import { getUnitOfWork } from './unitofwork';

export function getUserService() {
  const unitOfWork = getUnitOfWork();

  const notificationService = getNotificationService();

  return new UserService(
    unitOfWork.userRepository,
    unitOfWork.blogRepository,
    unitOfWork.notificationRepository,
    notificationService,
  );
}

export function getUserController() {
  const userService = getUserService();

  return new UserController(userService);
}
