import { UserController } from 'server/controllers/user';
import { UserRepository } from 'server/repositories/user';
import { UserService } from 'server/services/user';
import { getBlogRepository } from './blog';
import { getNotificationRepository, getNotificationService } from './notification';

export function getUserRepository() {
  return new UserRepository();
}

export function getUserService() {
  const userRepository = getUserRepository();

  const blogRepository = getBlogRepository();

  const notificationRepository = getNotificationRepository();

  const notificationService = getNotificationService();

  return new UserService(
    userRepository,
    blogRepository,
    notificationRepository,
    notificationService,
  );
}

export function getUserController() {
  const userService = getUserService();

  return new UserController(userService);
}
