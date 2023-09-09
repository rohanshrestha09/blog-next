import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { prisma, User } from 'lib/prisma';
import { supabase } from 'lib/supabase';
import { auth } from 'middlewares/auth';
import { errorHandler, HttpException } from 'utils/exception';
import { httpResponse } from 'utils/response';
import { SUPABASE_BUCKET_NAME, SUPABASE_BUCKET_DIRECTORY } from 'constants/index';

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth()).delete(async (req, res) => {
  const authUser = req.auth;

  if (authUser.image && authUser.imageName) {
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .remove([`${SUPABASE_BUCKET_DIRECTORY.USER}/${authUser.imageName}`]);

    if (error) throw new HttpException(500, error.message);
  }

  await prisma.user.update({
    where: {
      id: authUser.id,
    },
    data: {
      image: null,
      imageName: null,
    },
  });

  return res.status(201).json(httpResponse('Profile image removed'));
});

export default router.handler({ onError: errorHandler });
