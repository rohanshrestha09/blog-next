import { AuthController } from 'server/controllers/auth';
import { AuthGuard } from 'server/guards/auth';
import { UserRepository } from 'server/repositories/user';
import { AuthService } from 'server/services/auth';
import { getBlogRepository, getBlogService } from './blog';
import { getSupabaseService } from './supabase';
import { getUserRepository, getUserService } from './user';

export function getAuthGuard() {
  const userRepository = new UserRepository();

  return new AuthGuard(userRepository);
}

export function getAuthService() {
  const userRepository = getUserRepository();

  const blogRepository = getBlogRepository();

  const supabaseService = getSupabaseService();

  return new AuthService(userRepository, supabaseService, blogRepository);
}

export function getAuthController() {
  const userService = getUserService();

  const blogService = getBlogService();

  const authService = getAuthService();

  return new AuthController(authService, userService, blogService);
}
