import { BlogController } from 'server/controllers/blog';
import { BlogRepository } from 'server/repositories/blog';
import { BlogService } from 'server/services/blog';
import { getSupabaseService } from './supabase';

export function getBlogRepository() {
  return new BlogRepository();
}

export function getBlogService() {
  const blogRepository = getBlogRepository();

  const supabaseService = getSupabaseService();

  return new BlogService(blogRepository, supabaseService);
}

export function getBlogController() {
  const blogService = getBlogService();

  return new BlogController(blogService);
}
