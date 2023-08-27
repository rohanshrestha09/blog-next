import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { JwtPayload, Secret, verify } from 'jsonwebtoken';
import { exculdeFields, prisma, userFields } from 'lib/prisma';
import { HttpException } from 'utils/exception';
import { User } from 'interface/models';

export const auth = () => {
  return async (req: NextApiRequest & { auth: User }, _res: NextApiResponse, next: NextHandler) => {
    const { token } = req.cookies;

    if (!token) throw new HttpException(401, 'Unauthorized');

    const { id, email } = verify(token, process.env.JWT_TOKEN as Secret) as JwtPayload;

    const auth = await prisma.user.findUniqueOrThrow({
      where: { id, email },
      select: { ...exculdeFields(userFields, ['password']), followedBy: true, following: true },
    });

    req.auth = auth;

    await next();
  };
};
