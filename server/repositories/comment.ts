import { Prisma, PrismaClient } from '@prisma/client';
import { isEmpty } from 'lodash';
import { blogFields, commentFields, excludeFields, userFields } from 'server/lib/prisma';
import { Comment, CommentCreate, CommentQuery } from 'server/models/comment';
import { User } from 'server/models/user';
import { ICommentQueryBuilder, ICommentRepository } from 'server/ports/comment';
import { DeepPartial } from 'server/utils/types';

const sessionSelect = <T>(condition: T) => ({
  ...commentFields,
  user: {
    select: {
      ...excludeFields(userFields, ['email', 'password']),
    },
  },
  blog: { select: blogFields },
  likedBy: condition,
  _count: {
    select: {
      likedBy: true,
    },
  },
});

const transformComment = (
  comment: DeepPartial<Comment> & {
    likedBy?: User[];
  },
) => {
  const hasLiked = !isEmpty(comment.likedBy);

  delete comment.likedBy;

  return {
    ...comment,
    hasLiked,
  } as Comment;
};

class CommentQueryBuilder implements ICommentQueryBuilder {
  constructor(
    private readonly commentInstance: PrismaClient['comment'],
    private readonly options: Prisma.CommentFindManyArgs,
  ) {}

  withPagination(page: number, size: number) {
    this.options.skip = (page - 1) * (size || 20);

    this.options.take = size;

    return this;
  }

  withSort(sort: string, order: 'desc' | 'asc') {
    const countSort = ['likedBy'];

    if (countSort.includes(sort)) {
      this.options.orderBy = {
        [sort]: {
          _count: order,
        },
      };
    } else {
      this.options.orderBy = {
        [sort]: order,
      };
    }

    return this;
  }

  withSearch(search = '') {
    this.options.where = {
      ...this.options.where,
      content: {
        contains: search,
        mode: 'insensitive',
      },
    };

    return this;
  }

  async execute(sessionId?: string): Promise<[Comment[], number]> {
    const condition = sessionId ? { where: { id: sessionId }, take: 1 } : false;

    const count = await this.commentInstance.count({
      ...this.options,
      select: true,
      include: undefined as never,
    });

    const data = await this.commentInstance.findMany({
      ...this.options,
      select: sessionSelect(condition),
    });

    return [data.map((v) => transformComment(v)), count];
  }
}

export class CommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAllComments(options: CommentQuery): ICommentQueryBuilder {
    return new CommentQueryBuilder(this.prisma.comment, { where: options });
  }

  async createComment(data: CommentCreate): Promise<Comment> {
    return await this.prisma.comment.create({ data });
  }

  async addLike(commentId: number, userId: string): Promise<Comment> {
    return await this.prisma.comment.update({
      where: { id: commentId },
      data: { likedBy: { connect: { id: userId } } },
    });
  }

  async removeLike(commentId: number, userId: string): Promise<void> {
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { likedBy: { disconnect: { id: userId } } },
    });
  }

  async deleteCommentByID(user: User, id: number): Promise<void> {
    await this.prisma.comment.delete({
      where: { id, userId: user.id },
    });
  }
}
