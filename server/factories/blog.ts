import { BlogController } from 'server/controllers/blog';
import { BlogRepository } from 'server/repositories/blog';
import { BlogService } from 'server/services/blog';

export function getBlogRepository() {
  return new BlogRepository();
}

export function getBlogService() {
  const blogRepository = getBlogRepository();

  return new BlogService(blogRepository);
}

export function getBlogController() {
  const blogService = getBlogService();

  return new BlogController(blogService);
}
