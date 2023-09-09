import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { JwtPayload, Secret, verify } from 'jsonwebtoken';
import { exculdeFields, prisma, userFields } from 'lib/prisma';

export const session = () => {
  return async (
    req: NextApiRequest & { session: Session },
    _res: NextApiResponse,
    next: NextHandler,
  ) => {
    const { token } = req.cookies;

    if (token) {
      const { id, email } = verify(token, process.env.JWT_TOKEN as Secret) as JwtPayload;

      const user = await prisma.user.findUniqueOrThrow({
        where: { id, email },
        select: exculdeFields(userFields, ['password']),
      });

      req.session = { userId: user.id };
    } else {
      req.session = {};
    }

    await next();
  };
};
