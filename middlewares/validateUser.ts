import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { exculdeFields, prisma, userFields, User } from 'lib/prisma';
import { HttpException } from 'utils/exception';

export const validateUser = () => {
  return async (req: NextApiRequest & { user: User }, _res: NextApiResponse, next: NextHandler) => {
    const { userId } = req.query;

    if (Array.isArray(userId)) throw new HttpException(400, 'Invalid operation');

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        ...exculdeFields(userFields, ['password', 'email']),
        _count: {
          select: {
            following: true,
            followedBy: true,
          },
        },
      },
    });

    req.user = user;

    await next();
  };
};
