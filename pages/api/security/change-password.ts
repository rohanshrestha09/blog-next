import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { prisma, User } from 'lib/prisma';
import { auth } from 'middlewares/auth';
import { errorHandler, HttpException } from 'utils/exception';
import { httpResponse } from 'utils/response';

const validator = Joi.object<{
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}>({
  password: Joi.string().required(),
  newPassword: Joi.string().min(8).max(18).required(),
  confirmNewPassword: Joi.ref('newPassword'),
});

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth()).post(async (req, res) => {
  const { id: authId } = req.auth;

  const { password, newPassword } = await validator.validateAsync(req.body);

  const authUser = await prisma.user.findUniqueOrThrow({ where: { id: authId } });

  const isMatched = await bcrypt.compare(password, authUser.password);

  if (!isMatched) throw new HttpException(403, 'Incorrect Password');

  const salt = await bcrypt.genSalt(10);

  const encryptedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: authUser.id },
    data: {
      password: encryptedPassword,
    },
  });

  return res.status(201).json(httpResponse('Password Changed Successfully'));
});

export default router.handler({ onError: errorHandler });
