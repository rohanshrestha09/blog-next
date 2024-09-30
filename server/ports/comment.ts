import { QueryBuilder } from 'server/helpers/query-builder';
import { Comment, CommentCreate, CommentQuery } from 'server/models/comment';
import { User } from 'server/models/user';

export interface ICommentQueryBuilder extends QueryBuilder<Comment> {}

export interface ICommentRepository {
  findAllComments(options: CommentQuery): ICommentQueryBuilder;
  addLike(commentId: number, userId: string): Promise<Comment>;
  removeLike(commentId: number, userId: string): Promise<void>;
  createComment(data: CommentCreate): Promise<Comment>;
  deleteCommentByID(user: User, id: number): Promise<void>;
}

export interface ICommentService {
  likeComment(user: User, commentId: number): Promise<void>;
  unlikeComment(user: User, commentId: number): Promise<void>;
  createComment(user: User, data: Pick<Comment, 'content' | 'blogId'>): Promise<Comment>;
  deleteComment(user: User, id: number): Promise<void>;
}
