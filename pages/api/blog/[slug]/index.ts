import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { readFileSync } from 'fs';
import Joi from 'joi';
import { isEmpty } from 'lodash';
import { v4 as uuidV4 } from 'uuid';
import { Blog, Genre, prisma, User } from 'lib/prisma';
import { supabase } from 'lib/supabase';
import { auth } from 'middlewares/auth';
import { session } from 'middlewares/session';
import { validateBlog } from 'middlewares/validateBlog';
import { errorHandler, HttpException } from 'utils/exception';
import { getResponse, httpResponse } from 'utils/response';
import { parseFormData } from 'utils/parseFormData';
import { SUPABASE_BUCKET_DIRECTORY, SUPABASE_BUCKET_NAME } from 'constants/index';

const validator = Joi.object<{
  title: string;
  content: string;
  genre: Genre;
}>({
  title: Joi.string(),
  content: Joi.string(),
  genre: Joi.string().allow(...Object.values(Genre)),
});

const router = createRouter<
  NextApiRequest & { session: Session; auth: User; blog: Blog },
  NextApiResponse
>();

router.use(session(), validateBlog());

router.get(async (req, res) => {
  const blog = await prisma.blog.findUniqueWithSession({
    session: req.session,
    where: {
      id: req.blog.id,
    },
  });

  return res.status(200).json(getResponse('Blog fetched', blog));
});

router.use(auth(), async (req, _res, next) => {
  if (req.auth.id !== req.blog.authorId) throw new HttpException(401, 'Unauthorised');

  await next();
});

router.put(async (req, res) => {
  const blog = req.blog;

  const { fields, files } = await parseFormData(req);

  const { title, content, genre } = await validator.validateAsync(fields);

  if (!isEmpty(files?.image)) {
    const file = files?.image?.[0] as any;

    if (!file?.headers?.['content-type'].startsWith('image/'))
      throw new HttpException(403, 'Please choose an image');

    const uuid = uuidV4();

    const fileName = file?.headers?.['content-type'].replace('image/', `${uuid}.`);

    const { data: uploadedFile, error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload(`${SUPABASE_BUCKET_DIRECTORY.BLOG}/${fileName}`, readFileSync(file?.path));

    if (error) throw new HttpException(500, error.message);

    if (blog.image && blog.imageName) {
      const { error } = await supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .remove([`${SUPABASE_BUCKET_DIRECTORY.BLOG}/${blog.imageName}`]);

      if (error) throw new HttpException(500, error.message);
    }

    const { data: preview } = supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .getPublicUrl(`${SUPABASE_BUCKET_DIRECTORY.BLOG}/${fileName}`);

    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        image: preview.publicUrl,
        imageName: uploadedFile.path,
      },
    });
  }

  await prisma.blog.update({
    where: { id: blog.id },
    data: {
      title,
      content,
      genre,
    },
  });

  return res.status(201).json({ blog: blog.id, message: 'Blog Updated Successfully' });
});

router.delete(async (req, res) => {
  const blog = req.blog;

  if (blog.image && blog.imageName) {
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .remove([`${SUPABASE_BUCKET_DIRECTORY.BLOG}/${blog.imageName}`]);

    if (error) throw new HttpException(500, error.message);
  }

  await prisma.blog.delete({ where: { id: blog.id } });

  return res.status(201).json(httpResponse('Blog Deleted'));
});

export default router.handler({ onError: errorHandler });

export const config = {
  api: {
    bodyParser: false,
  },
};
