import { BlogController } from 'server/controllers/blog';
import { BlogService } from 'server/services/blog';
import { getSupabaseService } from './supabase';
import { getNotificationService } from './notification';
import { getUnitOfWork } from './unitofwork';

export function getBlogService() {
  const unitOfWork = getUnitOfWork();

  const supabaseService = getSupabaseService();

  const notificationService = getNotificationService();

  return new BlogService(
    unitOfWork,
    unitOfWork.blogRepository,
    unitOfWork.userRepository,
    unitOfWork.commentRepository,
    unitOfWork.notificationRepository,
    supabaseService,
    notificationService,
  );
}

export function getBlogController() {
  const blogService = getBlogService();

  return new BlogController(blogService);
}
