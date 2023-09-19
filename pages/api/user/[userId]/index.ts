import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma, User } from 'lib/prisma';
import { session } from 'middlewares/session';
import { validateUser } from 'middlewares/validateUser';
import { errorHandler } from 'utils/exception';
import { getResponse } from 'utils/response';

const router = createRouter<NextApiRequest & { session: Session; user: User }, NextApiResponse>();

router.use(session());

router.use(validateUser()).get(async (req, res) => {
  const user = await prisma.user.findUniqueWithSession({
    session: req.session,
    where: {
      id: req.user.id,
    },
  });

  return res.status(200).json(getResponse('User fetched', user));
});

export default router.handler({ onError: errorHandler });
