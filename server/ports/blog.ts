import { Blog, BlogCreate, BlogQuery, BlogUpdate } from 'server/models/blog';
import { QueryBuilder } from 'server/helpers/query-builder';
import { FilterProps, MultipartyFile } from 'server/utils/types';
import { User } from 'server/models/user';
import { GENRE } from 'server/enums/genre';

export interface IBlogQueryBuilder extends QueryBuilder<Blog> {
  bookmarkedBy(userId: string): IBlogQueryBuilder;
  followedBy(userId: string): IBlogQueryBuilder;
  hasGenre(genre: GENRE): IBlogQueryBuilder;
}

export interface IBlogRepository {
  findBlogByID(id: number, sessionId?: string): Promise<Blog>;
  findBlogBySlug(slug: string, sessionId?: string): Promise<Blog>;
  findAllBlogs(options: BlogQuery): IBlogQueryBuilder;
  findRandomBlogs(options: BlogQuery, size: number): Promise<IBlogQueryBuilder>;
  createBlog(data: BlogCreate): Promise<Blog>;
  updateBlogBySlug(author: User, slug: string, data: BlogUpdate): Promise<void>;
  deleteBlogBySlug(slug: string, returning?: Partial<Record<keyof Blog, boolean>>): Promise<Blog>;
}

export interface IBlogService {
  getBlog(slug: string, sessionId?: string): Promise<Blog>;
  getAllBlogs(
    options: Pick<Blog, 'genre'>,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Blog[], number]>;
  createBlog(
    user: User,
    data: Pick<Blog, 'title' | 'content' | 'genre' | 'isPublished'>,
    file?: MultipartyFile,
  ): Promise<Blog>;
  getBookmarks(userId: string, filter: FilterProps, sessionId?: string): Promise<[Blog[], number]>;
  getFollowingBlogs(
    userId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Blog[], number]>;
  getBlogSuggestions(filter: FilterProps, sessionId?: string): Promise<[Blog[], number]>;
  publishBlog(user: User, slug: string): Promise<void>;
  unpublishBlog(user: User, slug: string): Promise<void>;
}
