import { Blog, BlogCreate, BlogQuery, BlogUpdate } from 'server/models/blog';
import { QueryBuilder } from 'server/helpers/query-builder';
import { FilterProps, MultipartyFile } from 'server/utils/types';
import { User } from 'server/models/user';
import { GENRE } from 'server/enums/genre';
import { Comment } from 'server/models/comment';

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
  updateBlogBySlug(author: User, slug: string, data: BlogUpdate): Promise<Blog>;
  deleteBlogBySlug(
    author: User,
    slug: string,
    returning?: Partial<Record<keyof Blog, boolean>>,
  ): Promise<Blog>;
  addLike(slug: string, userId: string): Promise<Blog>;
  removeLike(slug: string, userId: string): Promise<void>;
  addBookmark(slug: string, userId: string): Promise<void>;
  removeBookmark(slug: string, userId: string): Promise<void>;
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
  updateBlog(
    user: User,
    slug: string,
    data: Pick<Blog, 'title' | 'content' | 'genre'>,
    file?: MultipartyFile,
  ): Promise<Blog>;
  deleteBlog(user: User, slug: string): Promise<void>;
  getBookmarks(userId: string, filter: FilterProps, sessionId?: string): Promise<[Blog[], number]>;
  getFollowingBlogs(
    userId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Blog[], number]>;
  getBlogSuggestions(filter: FilterProps, sessionId?: string): Promise<[Blog[], number]>;
  getBlogLikers(slug: string, filter: FilterProps, sessionId?: string): Promise<[User[], number]>;
  publishBlog(user: User, slug: string): Promise<void>;
  unpublishBlog(user: User, slug: string): Promise<void>;
  likeBlog(user: User, slug: string): Promise<void>;
  unlikeBlog(user: User, slug: string): Promise<void>;
  bookmarkBlog(user: User, slug: string): Promise<void>;
  unbookmarkBlog(user: User, slug: string): Promise<void>;
  getBlogComments(
    slug: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Comment[], number]>;
}
