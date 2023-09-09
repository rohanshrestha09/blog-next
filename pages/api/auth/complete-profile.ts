import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { prisma, User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { errorHandler } from 'utils/exception';
import { httpResponse } from 'utils/response';

const validator = Joi.object<{
  password: string;
  confirmPassword: string;
}>({
  password: Joi.string().min(8).max(18).required(),
  confirmPassword: Joi.ref('password'),
});

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth()).patch(async (req, res) => {
  const authUser = req.auth;

  const { password } = await validator.validateAsync(req.body);

  const salt = await bcrypt.genSalt(10);

  const encryptedPassword = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where: {
      id: authUser.id,
    },
    data: {
      password: encryptedPassword,
      isVerified: true,
    },
  });

  return res.status(201).json(httpResponse('Profile Completed'));
});

export default router.handler({ onError: errorHandler });
