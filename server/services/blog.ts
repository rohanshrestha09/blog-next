import { Blog } from 'server/models/blog';
import { IBlogRepository, IBlogService } from 'server/ports/blog';
import { FilterProps } from 'server/utils/types';

export class BlogService implements IBlogService {
  constructor(private readonly blogRepository: IBlogRepository) {}

  async getBlog(slug: string, sessionId?: string): Promise<Blog> {
    return await this.blogRepository.findBlogBySlug(slug);
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
      .execute(sessionId);
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
      .execute(sessionId);
  }

  async getBlogSuggestions(filter: FilterProps, sessionId?: string): Promise<[Blog[], number]> {
    const builder = await this.blogRepository.findRandomBlogs({ isPublished: true }, filter.size);

    return await builder
      .withPagination(filter.page, filter.size)
      .withSearch(filter.search)
      .execute(sessionId);
  }
}
