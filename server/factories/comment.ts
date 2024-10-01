import { CommentService } from 'server/services/comment';
import { CommentController } from 'server/controllers/comment';
import { getNotificationService } from './notification';
import { getUnitOfWork } from './unitofwork';

export function getCommentService() {
  const unitOfWork = getUnitOfWork();

  const notificationService = getNotificationService();

  return new CommentService(
    unitOfWork.commentRepository,
    unitOfWork.blogRepository,
    unitOfWork.notificationRepository,
    notificationService,
  );
}

export function getCommentController() {
  const commentService = getCommentService();

  return new CommentController(commentService);
}
