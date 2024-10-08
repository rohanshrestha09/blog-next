import { readFileSync } from 'fs';
import { kebabCase } from 'lodash';
import { v4 as uuidV4 } from 'uuid';
import { NotificationType } from 'server/enums/notification';
import { HttpException } from 'server/exception';
import { Blog } from 'server/models/blog';
import { Comment } from 'server/models/comment';
import { User } from 'server/models/user';
import { IBlogRepository, IBlogService } from 'server/ports/blog';
import { ICommentRepository } from 'server/ports/comment';
import { INotificationRepository, INotificationService } from 'server/ports/notification';
import { ISupabaseService } from 'server/ports/supabase';
import { IUserRepository } from 'server/ports/user';
import { FilterProps, MultipartyFile } from 'server/utils/types';
import { IUnitOfWork } from 'server/ports/unitofwork';

export class BlogService implements IBlogService {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly blogRepository: IBlogRepository,
    private readonly userRepository: IUserRepository,
    private readonly commentRepository: ICommentRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly supabaseService: ISupabaseService,
    private readonly notificationService: INotificationService,
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
    return await this.unitOfWork.beginTx(async (tx) => {
      const blog = await tx.blogRepository.createBlog({
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

        const uuid = uuidV4();

        const filename = file?.headers?.['content-type'].replace('image/', `${uuid}.`);

        const uploadedFilePath = await this.supabaseService.uploadFile(
          'blogs',
          filename,
          readFileSync(file?.path),
        );

        const previewUrl = await this.supabaseService.downloadFile('blogs', filename);

        await tx.blogRepository.updateBlogBySlug(user, blog.slug, {
          image: previewUrl,
          imageName: uploadedFilePath,
        });
      }

      return blog;
    });
  }

  async updateBlog(
    user: User,
    slug: string,
    data: Pick<Blog, 'title' | 'content' | 'genre'>,
    file?: MultipartyFile,
  ): Promise<Blog> {
    return await this.unitOfWork.beginTx(async (tx) => {
      const blog = await tx.blogRepository.updateBlogBySlug(user, slug, {
        title: data.title,
        slug: kebabCase(data.title),
        content: data.content,
        genre: data.genre,
      });

      if (file) {
        if (!file?.headers?.['content-type'].startsWith('image/'))
          throw new HttpException(403, 'Please choose an image');

        const uuid = uuidV4();

        const filename = file?.headers?.['content-type'].replace('image/', `${uuid}.`);

        const uploadedFilePath = await this.supabaseService.uploadFile(
          'blogs',
          filename,
          readFileSync(file?.path),
        );

        const previewUrl = await this.supabaseService.downloadFile('blogs', filename);

        if (blog.image && blog.imageName) {
          await this.supabaseService.deleteFile('blogs', [blog.imageName]);
        }

        await tx.blogRepository.updateBlogBySlug(user, slug, {
          image: previewUrl,
          imageName: uploadedFilePath,
        });
      }

      return blog;
    });
  }

  async deleteBlog(user: User, slug: string): Promise<void> {
    await this.unitOfWork.beginTx(async (tx) => {
      const blog = await tx.blogRepository.deleteBlogBySlug(user, slug, {
        image: true,
        imageName: true,
      });

      if (blog.image && blog.imageName) {
        await this.supabaseService.deleteFile('blogs', [blog.imageName]);
      }
    });
  }

  async getBlogSuggestions(filter: FilterProps, sessionId?: string): Promise<[Blog[], number]> {
    const builder = await this.blogRepository.findRandomBlogs({ isPublished: true }, filter.size);

    return await builder
      .withPagination(filter.page, filter.size)
      .withSearch(filter.search)
      .execute(sessionId);
  }

  async getBlogLikers(
    slug: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[User[], number]> {
    return await this.userRepository
      .findAllUsers({})
      .hasLikedBlog(slug)
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .withSearch(filter.search)
      .execute(sessionId);
  }

  async publishBlog(user: User, slug: string): Promise<void> {
    await this.blogRepository.updateBlogBySlug(user, slug, { isPublished: true });
  }

  async unpublishBlog(user: User, slug: string): Promise<void> {
    await this.blogRepository.updateBlogBySlug(user, slug, { isPublished: false });
  }

  async likeBlog(user: User, slug: string): Promise<void> {
    const blog = await this.blogRepository.addLike(slug, user.id);

    const notificationExists = await this.notificationRepository.notificationExists({
      type: NotificationType.LIKE_BLOG,
      senderId: user.id,
      blogId: blog.id,
      receiverId: blog.authorId,
    });

    if (!notificationExists) {
      const notification = await this.notificationRepository.createNotification({
        type: NotificationType.LIKE_BLOG,
        senderId: user.id,
        blogId: blog.id,
        receiverId: blog.authorId,
        description: `${user.name} liked your blog.`,
      });

      await this.notificationService.dispatchNotification(notification);
    }
  }

  async unlikeBlog(user: User, slug: string): Promise<void> {
    await this.blogRepository.removeLike(slug, user.id);
  }

  async bookmarkBlog(user: User, slug: string): Promise<void> {
    await this.blogRepository.addBookmark(slug, user.id);
  }

  async unbookmarkBlog(user: User, slug: string): Promise<void> {
    await this.blogRepository.removeBookmark(slug, user.id);
  }

  async getBlogComments(
    slug: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[Comment[], number]> {
    const blog = await this.blogRepository.findBlogBySlug(slug);

    return await this.commentRepository
      .findAllComments({ blogId: blog.id })
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .execute(sessionId);
  }
}
