import { NextApiRequest, NextApiResponse } from 'next';
import { ResponseDto } from 'server/dtos/response';
import { WithAuthRequest } from 'server/utils/types';
import { parseFormData, parseQuery } from 'server/utils/parser';
import { IBlogService } from 'server/ports/blog';
import { GENRE } from 'server/enums/genre';
import { HttpException } from 'server/exception';
import { createBlogDto, updateBlogDto } from 'server/dtos/blog';

export class BlogController {
  constructor(private readonly blogService: IBlogService) {}

  async getBlog(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    const { slug } = req.query;

    if (typeof slug !== 'string') throw new HttpException(400, 'Invalid slug');

    const data = await this.blogService.getBlog(slug, authUser?.id);

    if (!data.isPublished && data.authorId !== authUser?.id)
      throw new HttpException(400, 'Blog does not exist');

    return res.status(200).json(new ResponseDto('Blog fetched', data));
  }

  async getAllBlogs(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    const filter = await parseQuery(req.query);

    const { genre = '' } = req.query;

    const [data, count] = await this.blogService.getAllBlogs(
      { genre: genre?.toString()?.split(',').filter(Boolean) as GENRE },
      filter,
      authUser?.id,
    );

    return res.status(200).json(
      new ResponseDto('Blogs fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }

  async createBlog(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { fields, files } = await parseFormData(req);

    const data = await createBlogDto.validateAsync(fields);

    const blog = await this.blogService.createBlog(authUser, data, files?.[0]);

    return res.status(201).json(new ResponseDto('Blog created', { slug: blog.slug }));
  }

  async updateBlog(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { slug } = req.query;

    if (typeof slug !== 'string') throw new HttpException(400, 'Invalid slug');

    const { fields, files } = await parseFormData(req);

    const data = await updateBlogDto.validateAsync(fields);

    const blog = await this.blogService.updateBlog(authUser, slug, data, files?.[0]);

    return res.status(201).json(new ResponseDto('Blog updated', { slug: blog.slug }));
  }

  async deleteBlog(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { slug } = req.query;

    if (typeof slug !== 'string') throw new HttpException(400, 'Invalid slug');

    await this.blogService.deleteBlog(authUser, slug);

    return res.status(201).json(new ResponseDto('Blog deleted'));
  }

  async getBlogSuggestions(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    const filter = await parseQuery(req.query);

    const [data, count] = await this.blogService.getBlogSuggestions(filter, authUser?.id);

    return res.status(200).json(
      new ResponseDto('Blog suggestions fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }

  async publishBlog(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { slug } = req.query;

    if (typeof slug !== 'string') throw new HttpException(400, 'Invalid slug');

    await this.blogService.publishBlog(authUser, slug);

    return res.status(200).json(new ResponseDto('Blog published'));
  }

  async unpublishBlog(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { slug } = req.query;

    if (typeof slug !== 'string') throw new HttpException(400, 'Invalid slug');

    await this.blogService.unpublishBlog(authUser, slug);

    return res.status(200).json(new ResponseDto('Blog unpublished'));
  }

  async getBlogLikers(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    const { slug } = req.query;

    if (typeof slug !== 'string') throw new HttpException(400, 'Invalid slug');

    const filter = await parseQuery(req.query);

    const [data, count] = await this.blogService.getBlogLikers(slug, filter, authUser?.id);

    return res.status(200).json(
      new ResponseDto('Blog likers fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }

  async likeBlog(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { slug } = req.query;

    if (typeof slug !== 'string') throw new HttpException(400, 'Invalid slug');

    await this.blogService.likeBlog(authUser, slug);

    return res.status(201).json(new ResponseDto('Blog liked'));
  }

  async unlikeBlog(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { slug } = req.query;

    if (typeof slug !== 'string') throw new HttpException(400, 'Invalid slug');

    await this.blogService.unlikeBlog(authUser, slug);

    return res.status(201).json(new ResponseDto('Blog unliked'));
  }

  async bookmarkBlog(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { slug } = req.query;

    if (typeof slug !== 'string') throw new HttpException(400, 'Invalid slug');

    await this.blogService.bookmarkBlog(authUser, slug);

    return res.status(201).json(new ResponseDto('Blog bookmarked'));
  }

  async unbookmarkBlog(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { slug } = req.query;

    if (typeof slug !== 'string') throw new HttpException(400, 'Invalid slug');

    await this.blogService.unbookmarkBlog(authUser, slug);

    return res.status(201).json(new ResponseDto('Blog unbookmarked'));
  }

  async getBlogComments(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    const { slug } = req.query;

    if (typeof slug !== 'string') throw new HttpException(400, 'Invalid slug');

    const filter = await parseQuery(req.query);

    const [data, count] = await this.blogService.getBlogComments(slug, filter, authUser?.id);

    return res.status(200).json(
      new ResponseDto('Blog comments fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }
}
