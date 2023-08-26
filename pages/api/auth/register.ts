import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { readFileSync } from 'fs';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import Joi from 'joi';
import { Secret, sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import { isEmpty } from 'lodash';
import { prisma } from 'lib/prisma';
import { supabase } from 'lib/supabase';
import { parseFormData } from 'utils/parseFormData';
import { httpResponse } from 'utils/response';
import { errorHandler, HttpException } from 'utils/exception';
import { SUPABASE_BUCKET_NAME } from 'constants/index';
import { SUPABASE_BUCKET_DIRECTORY } from 'constants/index';

const validator = Joi.object<{
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: Date;
}>({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(18).required(),
  confirmPassword: Joi.ref('password'),
  dateOfBirth: Joi.date().required(),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
  const { fields, files } = await parseFormData(req);

  const body = await validator.validateAsync(fields);

  const { name, email, password, dateOfBirth } = body;

  const userExists = await prisma.user.findUnique({ where: { email } });

  if (userExists) throw new HttpException(403, 'User already exists. Choose a different email');

  const salt = await bcrypt.genSalt(10);

  const encryptedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: encryptedPassword,
      dateOfBirth: new Date(moment(dateOfBirth).format()),
      isVerified: true,
    },
  });

  if (!isEmpty(files?.image)) {
    const file = files?.image?.[0] as any;

    if (!file?.headers?.['content-type'].startsWith('image/'))
      throw new HttpException(403, 'Please choose an image');

    const fileName = file?.headers?.['content-type'].replace('image/', `${user.id}.`);

    const { data: uploadedFile, error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload(`${SUPABASE_BUCKET_DIRECTORY.USER}/${fileName}`, readFileSync(file?.path));

    if (error) throw new HttpException(500, error.message);

    const { data: preview } = supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .getPublicUrl(`${SUPABASE_BUCKET_DIRECTORY.USER}/${fileName}`);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        image: preview.publicUrl,
        imageName: uploadedFile.path,
      },
    });
  }

  const token: string = sign({ id: user.id, email: user.email }, process.env.JWT_TOKEN as Secret, {
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

  return res.status(201).json(httpResponse({ token }, 'Signup Successful'));
});

export default router.handler({ onError: errorHandler });

export const config = {
  api: {
    bodyParser: false,
  },
};
