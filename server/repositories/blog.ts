import { Prisma } from '@prisma/client';
import { prisma, blogFields, excludeFields, userFields } from 'server/lib/prisma';
import { isEmpty } from 'lodash';
import { Blog, BlogCreate, BlogQuery, BlogUpdate } from 'server/models/blog';
import { User } from 'server/models/user';
import { IBlogQueryBuilder, IBlogRepository } from 'server/ports/blog';
import { DeepPartial } from 'server/utils/types';
import { GENRE } from 'server/enums/genre';

const sessionSelect = <T>(condition: T) => ({
  ...blogFields,
  author: {
    select: {
      ...excludeFields(userFields, ['email', 'password']),
    },
  },
  likedBy: condition,
  bookmarkedBy: condition,
  _count: {
    select: {
      likedBy: true,
      comments: true,
    },
  },
});

const transformBlog = (
  blog: DeepPartial<Blog> & {
    likedBy?: User[];
    bookmarkedBy?: User[];
  },
) => {
  const hasLiked = !isEmpty(blog.likedBy);

  const hasBookmarked = !isEmpty(blog.bookmarkedBy);

  delete blog.likedBy;

  delete blog.bookmarkedBy;

  return {
    ...blog,
    hasLiked,
    hasBookmarked,
  } as Blog;
};

class BlogQueryBuilder implements IBlogQueryBuilder {
  constructor(
    private readonly blogInstance: typeof prisma.blog,
    private readonly options: Prisma.BlogFindManyArgs,
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
      title: {
        contains: search,
        mode: 'insensitive',
      },
    };

    return this;
  }

  bookmarkedBy(userId: string) {
    this.options.where = {
      ...this.options.where,
      bookmarkedBy: {
        some: { id: userId },
      },
    };

    return this;
  }

  followedBy(userId: string) {
    this.options.where = {
      ...this.options.where,
      author: {
        followedBy: {
          some: { id: userId },
        },
      },
    };

    return this;
  }

  hasGenre(genre: GENRE) {
    this.options.where = {
      ...this.options.where,
      genre: {
        hasSome: genre,
      },
    };

    return this;
  }

  async execute(sessionId?: string): Promise<[Blog[], number]> {
    const condition = sessionId ? { where: { id: sessionId }, take: 1 } : false;

    const count = await this.blogInstance.count({
      ...this.options,
      select: true,
      include: undefined as never,
    });

    const data = await this.blogInstance.findMany({
      ...this.options,
      select: sessionSelect(condition),
    });

    return [data.map((v) => transformBlog(v)), count];
  }
}

export class BlogRepository implements IBlogRepository {
  async findBlogByID(id: number, sessionId?: string): Promise<Blog> {
    const condition = sessionId ? { where: { id: sessionId }, take: 1 } : false;

    const data = await prisma.blog.findUniqueOrThrow({
      where: { id },
      select: sessionSelect(condition),
    });

    return transformBlog(data);
  }

  async findBlogBySlug(slug: string, sessionId?: string): Promise<Blog> {
    const condition = sessionId ? { where: { id: sessionId }, take: 1 } : false;

    const data = await prisma.blog.findUniqueOrThrow({
      where: { slug },
      select: sessionSelect(condition),
    });

    return transformBlog(data);
  }

  findAllBlogs(options: BlogQuery): IBlogQueryBuilder {
    return new BlogQueryBuilder(prisma.blog, { where: options });
  }

  async findRandomBlogs(options: BlogQuery, size: number): Promise<IBlogQueryBuilder> {
    const results = await prisma.$queryRawUnsafe<{ id: number }[]>(
      `SELECT id FROM public."Blog" ORDER BY RANDOM() LIMIT ${size};`,
    );

    const ids = results.map((item) => item.id);

    return new BlogQueryBuilder(prisma.blog, { where: { ...options, id: { in: ids } } });
  }

  async createBlog(data: BlogCreate): Promise<Blog> {
    return await prisma.blog.create({ data });
  }

  async updateBlogBySlug(user: User, slug: string, data: BlogUpdate): Promise<void> {
    await prisma.blog.update({ where: { slug, authorId: user.id }, data });
  }

  async deleteBlogBySlug(
    user: User,
    slug: string,
    returning?: Partial<Record<keyof Blog, boolean>> | undefined,
  ): Promise<Blog> {
    return await prisma.blog.delete({ where: { slug, authorId: user.id }, select: returning });
  }

  async addLike(slug: string, userId: string): Promise<Blog> {
    return await prisma.blog.update({
      where: { slug, isPublished: true },
      data: {
        likedBy: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async removeLike(slug: string, userId: string): Promise<void> {
    await prisma.blog.update({
      where: { slug, isPublished: true },
      data: {
        likedBy: {
          disconnect: {
            id: userId,
          },
        },
      },
    });
  }

  async addBookmark(slug: string, userId: string): Promise<void> {
    await prisma.blog.update({
      where: { slug, isPublished: true },
      data: {
        bookmarkedBy: {
          connect: { id: userId },
        },
      },
    });
  }

  async removeBookmark(slug: string, userId: string): Promise<void> {
    await prisma.blog.update({
      where: { slug, isPublished: true },
      data: {
        bookmarkedBy: {
          disconnect: { id: userId },
        },
      },
    });
  }
}
