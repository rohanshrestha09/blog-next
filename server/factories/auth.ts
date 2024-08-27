import { AuthController } from 'server/controllers/auth';
import { AuthGuard } from 'server/guards/auth';
import { BlogRepository } from 'server/repositories/blog';
import { UserRepository } from 'server/repositories/user';
import { AuthService } from 'server/services/auth';
import { BlogService } from 'server/services/blog';
import { SupabaseService } from 'server/services/supabase';
import { UserService } from 'server/services/user';

export function getAuthGuard() {
  const userRepository = new UserRepository();

  return new AuthGuard(userRepository);
}

export function getAuthController() {
  const userRepository = new UserRepository();

  const blogRepository = new BlogRepository();

  const supabaseService = new SupabaseService();

  const authService = new AuthService(userRepository, supabaseService);

  const userService = new UserService(userRepository);

  const blogService = new BlogService(blogRepository);

  return new AuthController(authService, userService, blogService);
}
