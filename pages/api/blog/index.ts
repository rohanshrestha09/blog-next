import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { readFileSync } from 'fs';
import { v4 as uuidV4 } from 'uuid';
import Joi from 'joi';
import { isEmpty, kebabCase } from 'lodash';
import { prisma, Genre, User, Blog } from 'lib/prisma';
import { supabase } from 'lib/supabase';
import { auth } from 'middlewares/auth';
import { session } from 'middlewares/session';
import { errorHandler, HttpException } from 'utils/exception';
import { parseFormData } from 'utils/parseFormData';
import { parseQuery } from 'utils/parseQuery';
import { getAllResponse } from 'utils/response';
import { getPages } from 'utils';
import { SUPABASE_BUCKET_NAME, SUPABASE_BUCKET_DIRECTORY } from 'constants/index';

const validator = Joi.object<Pick<Blog, 'title' | 'content' | 'isPublished' | 'genre'>>({
  title: Joi.string().required(),
  content: Joi.string().required(),
  isPublished: Joi.boolean(),
  genre: Joi.array()
    .items(...Object.values(Genre))
    .required(),
});

const router = createRouter<NextApiRequest & { session: Session; auth: User }, NextApiResponse>();

router.use(session());

router.post(auth(), async (req, res) => {
  const { fields, files } = await parseFormData(req);

  const authUser = req.auth;

  const { title, content, genre, isPublished } = await validator.validateAsync(fields);

  const blog = await prisma.blog.create({
    data: {
      authorId: authUser.id,
      slug: kebabCase(title),
      title,
      content,
      genre,
      isPublished,
    },
  });

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

  return res.status(201).json({ data: { slug: blog.slug }, message: 'Blog Posted Successfully' });
});

router.get(async (req, res) => {
  const { take, skip, search, sort, order } = await parseQuery(req.query);

  const { genre } = req.query;

  const count = await prisma.blog.count({
    where: {
      title: {
        search,
      },
      genre: genre
        ? { hasSome: (Array.isArray(genre) ? genre : genre?.split(',')) as Genre[] }
        : undefined,
      isPublished: true,
    },
  });

  const blogs = await prisma.blog.findManyWithSession({
    where: {
      title: { search },
      genre: genre
        ? { hasSome: (Array.isArray(genre) ? genre : genre?.split(',')) as Genre[] }
        : undefined,
      isPublished: true,
    },
    session: req.session,
    skip,
    take,
    orderBy: {
      [sort]: order,
    },
  });

  const { currentPage, totalPage } = getPages({ skip, take, count });

  return res
    .status(200)
    .json(getAllResponse('Blogs fetched', { data: blogs, count, currentPage, totalPage }));
});

export default router.handler({ onError: errorHandler });

export const config = {
  api: {
    bodyParser: false,
  },
};
