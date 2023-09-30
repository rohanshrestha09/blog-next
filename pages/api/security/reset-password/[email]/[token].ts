import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { JwtPayload, verify } from 'jsonwebtoken';
import { prisma } from 'lib/prisma';
import { errorHandler, HttpException } from 'utils/exception';
import { httpResponse } from 'utils/response';

const validator = Joi.object<{ password: string; confirmPassword: string }>({
  password: Joi.string().min(8).max(18).required(),
  confirmPassword: Joi.ref('password'),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
  const { token, email: userEmail } = req.query;

  if (!token) throw new HttpException(403, 'Invalid token');

  const { password } = await validator.validateAsync(req.body);

  if (Array.isArray(userEmail) || Array.isArray(token))
    throw new HttpException(400, 'Invalid operation');

  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });

  const { id, email } = verify(token, `${process.env.JWT_PASSWORD}${user.password}`) as JwtPayload;

  const salt = await bcrypt.genSalt(10);

  const encryptedPassword = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where: { id, email },
    data: {
      password: encryptedPassword,
    },
  });

  return res.status(201).json(httpResponse('Password Reset Successful'));
});

export default router.handler({ onError: errorHandler });
