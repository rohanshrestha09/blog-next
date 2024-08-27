import { JwtPayload, verify } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { jwtConfig } from 'server/config/jwt';
import { HttpException } from 'server/exception';
import { UserRepository } from 'server/repositories/user';
import { WithAuthRequest } from 'server/utils/types';

export class AuthGuard {
  private readonly userRepository = new UserRepository();

  useAuth({ supressError } = { supressError: false }) {
    return async (
      req: WithAuthRequest<NextApiRequest>,
      _res: NextApiResponse,
      next: NextHandler,
    ): Promise<void> => {
      const { token } = req.cookies;

      if (!token && supressError) return await next();

      if (!token) throw new HttpException(401, 'Unauthorized');

      const { email } = verify(token, jwtConfig.secretKey) as JwtPayload;

      const authUser = await this.userRepository.findUserByEmail(email);

      req.authUser = authUser;

      await next();
    };
  }
}
