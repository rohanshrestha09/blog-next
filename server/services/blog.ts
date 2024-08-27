import { Blog } from 'server/models/blog';
import { IBlogRepository, IBlogService } from 'server/ports/blog';
import { FilterProps } from 'server/utils/types';

export class BlogService implements IBlogService {
  constructor(private readonly blogRepository: IBlogRepository) {}

  async getAuthorBlogs(
    authorId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Blog[], number]> {
    return await this.blogRepository
      .findAllBlogs({ isPublished: true, authorId })
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .withSearch(filter.search)
      .executeWithSession(sessionId);
  }

  async getBookmarks(
    userId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Blog[], number]> {
    return await this.blogRepository
      .findAllBlogs({ isPublished: true })
      .bookmarkedBy(userId)
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .withSearch(filter.search)
      .executeWithSession(sessionId);
  }

  async getFollowingBlogs(
    userId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Blog[], number]> {
    return await this.blogRepository
      .findAllBlogs({ isPublished: true })
      .followedBy(userId)
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .withSearch(filter.search)
      .executeWithSession(sessionId);
  }
}
