import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import { Secret, sign } from 'jsonwebtoken';
import { prisma } from 'lib/prisma';
import { errorHandler, HttpException } from 'utils/exception';
import { getResponse } from 'utils/response';

const validator = Joi.object<{ email: string; password: string }>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
  const { email, password } = await validator.validateAsync(req.body);

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });

  const isMatched = await bcrypt.compare(password, user.password);

  if (!isMatched) throw new HttpException(403, 'Incorrect Password');

  const token = sign({ id: user.id, email: user.email }, process.env.JWT_TOKEN as Secret, {
    expiresIn: '30d',
  });

  const serialized = serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  res.setHeader('Set-Cookie', serialized);

  return res.status(200).json(getResponse('Login Successful', { token }));
});

export default router.handler({ onError: errorHandler });
