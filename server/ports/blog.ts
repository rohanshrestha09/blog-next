import { Blog, BlogCreate, BlogQuery, BlogUpdate } from 'server/models/blog';
import { QueryBuilder } from 'server/helpers/query-builder';
import { FilterProps } from 'server/utils/types';
import { User } from 'server/models/user';

export interface IBlogQueryBuilder extends QueryBuilder<Blog> {
  bookmarkedBy(userId: string): IBlogQueryBuilder;
  followedBy(userId: string): IBlogQueryBuilder;
}

export interface IBlogRepository {
  findBlogByID(id: number): Promise<Blog>;
  findBlogBySlug(slug: string): Promise<Blog>;
  findAllBlogs(options: BlogQuery): IBlogQueryBuilder;
  findRandomBlogs(options: BlogQuery, size: number): Promise<IBlogQueryBuilder>;
  createBlog(data: BlogCreate): Promise<Blog>;
  updateBlogBySlug(author: User, slug: string, data: BlogUpdate): Promise<void>;
  deleteBlogBySlug(slug: string, returning?: Partial<Record<keyof Blog, boolean>>): Promise<Blog>;
}

export interface IBlogService {
  getBlog(slug: string, sessionId?: string): Promise<Blog>;
  getBookmarks(userId: string, filter: FilterProps, sessionId?: string): Promise<[Blog[], number]>;
  getFollowingBlogs(
    userId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Blog[], number]>;
  getBlogSuggestions(filter: FilterProps, sessionId?: string): Promise<[Blog[], number]>;
}
