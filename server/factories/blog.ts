import { BlogController } from 'server/controllers/blog';
import { BlogRepository } from 'server/repositories/blog';
import { BlogService } from 'server/services/blog';
import { getSupabaseService } from './supabase';
import { getUserRepository } from './user';
import { getNotificationRepository, getNotificationService } from './notification';
import { getCommentRepository } from './comment';

export function getBlogRepository() {
  return new BlogRepository();
}

export function getBlogService() {
  const blogRepository = getBlogRepository();

  const userRepository = getUserRepository();

  const commentRepository = getCommentRepository();

  const supabaseService = getSupabaseService();

  const notificationRepository = getNotificationRepository();

  const notificationService = getNotificationService();

  return new BlogService(
    blogRepository,
    userRepository,
    commentRepository,
    supabaseService,
    notificationRepository,
    notificationService,
  );
}

export function getBlogController() {
  const blogService = getBlogService();

  return new BlogController(blogService);
}
