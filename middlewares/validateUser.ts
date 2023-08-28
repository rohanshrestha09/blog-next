import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { exculdeFields, prisma, userFields } from 'lib/prisma';
import { HttpException } from 'utils/exception';
import { User } from 'interface/models';

export const validateUser = () => {
  return async (req: NextApiRequest & { user: User }, _res: NextApiResponse, next: NextHandler) => {
    const { userId } = req.query;

    if (Array.isArray(userId)) throw new HttpException(400, 'Invalid operation');

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: exculdeFields(userFields, ['email', 'password']),
    });

    req.user = user;

    await next();
  };
};
