import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { JwtPayload, Secret, verify } from 'jsonwebtoken';
import { exculdeFields, prisma, User, userFields } from 'lib/prisma';
import { HttpException } from 'utils/exception';

export const auth = async (
  req: NextApiRequest & { auth: User },
  res: NextApiResponse,
  next: NextHandler,
) => {
  const { token } = req.cookies;

  if (!token) throw new HttpException(401, 'Unauthorized');

  const { id, email } = verify(token, process.env.JWT_TOKEN as Secret) as JwtPayload;

  const auth = await prisma.user.findUnique({
    where: { id, email },
    select: exculdeFields(userFields, ['password']),
  });

  if (!auth) throw new HttpException(404, 'User does not exist');

  req.auth = auth;

  await next();
};
