import { Prisma } from '@prisma/client';
import { isEmpty } from 'lodash';
import { prisma } from 'server/lib/prisma';
import { Blog, BlogCreate, BlogQuery, BlogUpdate } from 'server/models/blog';
import { User } from 'server/models/user';
import { IBlogQueryBuilder, IBlogRepository } from 'server/ports/blog';
import { DeepPartial } from 'server/utils/types';

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

  async execute(): Promise<[Blog[], number]> {
    const data = await this.blogInstance.findMany({ ...this.options });

    const count = await this.blogInstance.count({
      ...this.options,
      select: true,
      include: undefined as never,
    });

    return [data, count];
  }

  async executeWithSession(userId?: string): Promise<[Blog[], number]> {
    const condition = userId ? { where: { id: userId }, take: 1 } : false;

    const count = await this.blogInstance.count({
      ...this.options,
      select: true,
      include: undefined as never,
    });

    const data = await this.blogInstance.findMany({
      ...this.options,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        image: true,
        imageName: true,
        genre: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            dateOfBirth: true,
            image: true,
            imageName: true,
            bio: true,
            website: true,
            provider: true,
            isSSO: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
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
      },
    });

    return [data.map((v) => transformBlog(v)), count];
  }
}

export class BlogRepository implements IBlogRepository {
  async findBlogByID(id: number): Promise<Blog> {
    return await prisma.blog.findUniqueOrThrow({ where: { id } });
  }

  async findBlogBySlug(slug: string): Promise<Blog> {
    return await prisma.blog.findUniqueOrThrow({ where: { slug } });
  }

  findAllBlogs(options: BlogQuery): IBlogQueryBuilder {
    return new BlogQueryBuilder(prisma.blog, { where: options });
  }

  async createBlog(data: BlogCreate): Promise<Blog> {
    return await prisma.blog.create({ data });
  }

  async updateBlogBySlug(slug: string, data: BlogUpdate): Promise<void> {
    await prisma.blog.update({ where: { slug }, data });
  }

  async deleteBlogBySlug(
    slug: string,
    returning?: Partial<Record<keyof Blog, boolean>> | undefined,
  ): Promise<Blog> {
    return await prisma.blog.delete({ where: { slug }, select: returning });
  }
}
