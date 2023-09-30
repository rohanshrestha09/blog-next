import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { readFileSync } from 'fs';
import Joi from 'joi';
import moment from 'moment';
import { serialize } from 'cookie';
import { isEmpty } from 'lodash';
import bcrypt from 'bcryptjs';
import { v4 as uuidV4 } from 'uuid';
import { prisma, User } from 'lib/prisma';
import { supabase } from 'lib/supabase';
import { session } from 'middlewares/session';
import { auth } from 'middlewares/auth';
import { errorHandler, HttpException } from 'utils/exception';
import { getResponse, httpResponse } from 'utils/response';
import { parseFormData } from 'utils/parseFormData';
import { SUPABASE_BUCKET_NAME, SUPABASE_BUCKET_DIRECTORY } from 'constants/index';

const validator = Joi.object<Partial<Pick<User, 'name' | 'bio' | 'website' | 'dateOfBirth'>>>({
  name: Joi.string(),
  bio: Joi.string(),
  website: Joi.string().domain(),
  dateOfBirth: Joi.date(),
});

const router = createRouter<NextApiRequest & { session: Session; auth: User }, NextApiResponse>();

router.use(session(), auth());

router.get(async (req, res) => {
  const authUser = await prisma.user.findUniqueWithSession({
    session: req.session,
    where: {
      id: req.auth.id,
    },
  });

  return res.status(200).json(getResponse('Profile fetched', authUser));
});

router.put(async (req, res) => {
  const authUser = req.auth;

  const { fields, files } = await parseFormData(req);

  const { name, bio, website, dateOfBirth } = await validator.validateAsync(fields);

  if (!isEmpty(files?.image)) {
    const file = files?.image?.[0] as any;

    if (!file?.headers?.['content-type'].startsWith('image/'))
      throw new HttpException(403, 'Please choose an image');

    const uuid = uuidV4();

    const fileName = file?.headers?.['content-type'].replace('image/', `${uuid}.`);

    const { data: uploadedFile, error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload(`${SUPABASE_BUCKET_DIRECTORY.USER}/${fileName}`, readFileSync(file?.path));

    if (error) throw new HttpException(500, error.message);

    if (authUser.image && authUser.imageName) {
      const { error } = await supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .remove([`${SUPABASE_BUCKET_DIRECTORY.USER}/${authUser.imageName}`]);

      if (error) throw new HttpException(500, error.message);
    }

    const { data: preview } = supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .getPublicUrl(`${SUPABASE_BUCKET_DIRECTORY.USER}/${fileName}`);

    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        image: preview.publicUrl,
        imageName: uploadedFile.path,
      },
    });
  }

  await prisma.user.update({
    where: { id: authUser.id },
    data: {
      name,
      bio,
      website,
      dateOfBirth: dateOfBirth && new Date(moment(dateOfBirth).format()),
    },
  });

  return res.status(201).json(httpResponse('Profile Updated Successfully'));
});

router.delete(async (req, res) => {
  const { id: authId } = req.auth;

  const { fields } = await parseFormData<{ password: string }>(req);

  const { password } = fields;

  const authUser = await prisma.user.findUniqueOrThrow({ where: { id: authId } });

  const isMatched = await bcrypt.compare(password, authUser.password);

  if (!isMatched) throw new HttpException(403, 'Incorrect Password');

  if (authUser.image && authUser.imageName) {
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .remove([`${SUPABASE_BUCKET_DIRECTORY.USER}/${authUser.imageName}`]);

    if (error) throw new HttpException(500, error.message);
  }

  const user = await prisma.user.delete({
    where: {
      id: authUser.id,
    },
    select: {
      blogs: true,
    },
  });

  await Promise.all(
    user.blogs.map(async (blog) => {
      if (blog.image && blog.imageName) {
        return await supabase.storage
          .from(SUPABASE_BUCKET_NAME)
          .remove([`${SUPABASE_BUCKET_DIRECTORY.BLOG}/${blog.imageName}`]);
      }
    }),
  );

  const serialized = serialize('token', '', {
    maxAge: 0,
    path: '/',
  });

  res.setHeader('Set-Cookie', serialized);

  return res.status(201).json(httpResponse('Profile deleted'));
});

export default router.handler({ onError: errorHandler });

export const config = {
  api: {
    bodyParser: false,
  },
};
