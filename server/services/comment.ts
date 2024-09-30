import { NotificationType } from 'server/enums/notification';
import { Comment } from 'server/models/comment';
import { User } from 'server/models/user';
import { IBlogRepository } from 'server/ports/blog';
import { ICommentRepository, ICommentService } from 'server/ports/comment';
import { INotificationRepository, INotificationService } from 'server/ports/notification';

export class CommentService implements ICommentService {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly blogRepository: IBlogRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async createComment(user: User, data: Pick<Comment, 'content' | 'blogId'>): Promise<Comment> {
    const blog = await this.blogRepository.findBlogByID(data.blogId);

    const comment = await this.commentRepository.createComment({ ...data, userId: user.id });

    const notification = await this.notificationRepository.createNotification({
      type: NotificationType.POST_COMMENT,
      senderId: user.id,
      receiverId: blog.authorId,
      blogId: blog.id,
      commentId: comment.id,
      description: `${user.name} commented on your blog.`,
    });

    await this.notificationService.dispatchNotification(notification);

    return comment;
  }

  async likeComment(user: User, commentId: number): Promise<void> {
    const comment = await this.commentRepository.addLike(commentId, user.id);

    const notificationExists = await this.notificationRepository.notificationExists({
      type: NotificationType.LIKE_COMMENT,
      senderId: user.id,
      blogId: comment.blogId,
      commentId: comment.id,
      receiverId: comment.userId,
    });

    if (!notificationExists) {
      const notification = await this.notificationRepository.createNotification({
        type: NotificationType.LIKE_COMMENT,
        senderId: user.id,
        blogId: comment.blogId,
        commentId: comment.id,
        receiverId: comment.userId,
        description: `${user.name} liked your comment.`,
      });

      await this.notificationService.dispatchNotification(notification);
    }
  }

  async unlikeComment(user: User, commentId: number): Promise<void> {
    await this.commentRepository.removeLike(commentId, user.id);
  }

  async deleteComment(user: User, id: number): Promise<void> {
    await this.commentRepository.deleteCommentByID(user, id);
  }
}
