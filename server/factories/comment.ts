import { CommentRepository } from 'server/repositories/comment';
import { CommentService } from 'server/services/comment';
import { CommentController } from 'server/controllers/comment';
import { getNotificationRepository, getNotificationService } from './notification';
import { getBlogRepository } from './blog';

export function getCommentRepository() {
  return new CommentRepository();
}

export function getCommentService() {
  const commentRepository = getCommentRepository();

  const blogRepository = getBlogRepository();

  const notificationRepository = getNotificationRepository();

  const notificationService = getNotificationService();

  return new CommentService(
    commentRepository,
    blogRepository,
    notificationRepository,
    notificationService,
  );
}

export function getCommentController() {
  const commentService = getCommentService();

  return new CommentController(commentService);
}
