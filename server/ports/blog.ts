import { Blog, BlogCreate, BlogQuery, BlogUpdate } from 'server/models/blog';
import { QueryBuilder } from 'server/helpers/query-builder';
import { FilterProps } from 'server/utils/types';

export interface IBlogQueryBuilder extends QueryBuilder<Blog> {
  bookmarkedBy(userId: string): IBlogQueryBuilder;
  followedBy(userId: string): IBlogQueryBuilder;
}

export interface IBlogRepository {
  findBlogByID(id: number): Promise<Blog>;
  findBlogBySlug(slug: string): Promise<Blog>;
  findAllBlogs(options: BlogQuery): IBlogQueryBuilder;
  createBlog(data: BlogCreate): Promise<Blog>;
  updateBlogBySlug(slug: string, data: BlogUpdate): Promise<void>;
  deleteBlogBySlug(slug: string, returning?: Partial<Record<keyof Blog, boolean>>): Promise<Blog>;
}

export interface IBlogService {
  getAuthorBlogs(
    authorId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Blog[], number]>;
  getBookmarks(userId: string, filter: FilterProps, sessionId?: string): Promise<[Blog[], number]>;
  getFollowingBlogs(
    userId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Blog[], number]>;
}
