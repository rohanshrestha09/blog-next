import { AuthController } from 'server/controllers/auth';
import { AuthGuard } from 'server/guards/auth';
import { AuthService } from 'server/services/auth';
import { getSupabaseService } from './supabase';
import { getUserService } from './user';
import { getUnitOfWork } from './unitofwork';

export function getAuthGuard() {
  const unitOfWork = getUnitOfWork();

  return new AuthGuard(unitOfWork.userRepository);
}

export function getAuthService() {
  const unitOfWork = getUnitOfWork();

  const supabaseService = getSupabaseService();

  return new AuthService(
    unitOfWork,
    unitOfWork.userRepository,
    unitOfWork.blogRepository,
    supabaseService,
  );
}

export function getAuthController() {
  const userService = getUserService();

  const authService = getAuthService();

  return new AuthController(authService, userService);
}
