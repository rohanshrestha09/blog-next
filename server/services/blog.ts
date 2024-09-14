import { readFileSync } from 'fs';
import { kebabCase } from 'lodash';
import { HttpException } from 'server/exception';
import { Blog } from 'server/models/blog';
import { User } from 'server/models/user';
import { IBlogRepository, IBlogService } from 'server/ports/blog';
import { ISupabaseService } from 'server/ports/supabase';
import { FilterProps, MultipartyFile } from 'server/utils/types';

export class BlogService implements IBlogService {
  constructor(
    private readonly blogRepository: IBlogRepository,
    private readonly supabaseService: ISupabaseService,
  ) {}

  async getBlog(slug: string, sessionId?: string): Promise<Blog> {
    return await this.blogRepository.findBlogBySlug(slug, sessionId);
  }

  async getAllBlogs(
    options: Pick<Blog, 'genre'>,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Blog[], number]> {
    return await this.blogRepository
      .findAllBlogs({ isPublished: true })
      .hasGenre(options.genre)
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .withSearch(filter.search)
      .execute(sessionId);
  }

  async createBlog(
    user: User,
    data: Pick<Blog, 'title' | 'content' | 'genre' | 'isPublished'>,
    file?: MultipartyFile,
  ): Promise<Blog> {
    const blog = await this.blogRepository.createBlog({
      authorId: user.id,
      slug: kebabCase(data.title),
      title: data.title,
      content: data.content,
      genre: data.genre,
      isPublished: data.isPublished,
    });

    if (file) {
      if (!file?.headers?.['content-type'].startsWith('image/'))
        throw new HttpException(403, 'Please choose an image');

      const filename = file?.headers?.['content-type'].replace('image/', `${user.id}.`);

      const uploadedFilePath = await this.supabaseService.uploadFile(
        'blogs',
        filename,
        readFileSync(file?.path),
      );

      const previewUrl = await this.supabaseService.downloadFile('blogs', filename);

      await this.blogRepository.updateBlogBySlug(user, blog.slug, {
        image: previewUrl,
        imageName: uploadedFilePath,
      });
    }

    return blog;
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

  async publishBlog(user: User, slug: string): Promise<void> {
    await this.blogRepository.updateBlogBySlug(user, slug, { isPublished: true });
  }

  async unpublishBlog(user: User, slug: string): Promise<void> {
    await this.blogRepository.updateBlogBySlug(user, slug, { isPublished: true });
  }
}
