import { NextApiRequest } from 'next';
import Joi from 'joi';

interface ParseQueryReturn {
  skip: number;
  take: number;
  sort: string;
  order: 'asc' | 'desc' | { _count: 'asc' | 'desc' };
  search?: string;
}

export async function parseQuery(query: NextApiRequest['query']): Promise<ParseQueryReturn> {
  const countSort = ['followedBy', 'likedBy'];

  const { page, size, search, sort, order } = await Joi.object({
    userId: Joi.string().disallow(''),
    notificationId: Joi.string().disallow(''),
    token: Joi.string().disallow(''),
    slug: Joi.string().disallow(''),
    page: Joi.number().empty('').default(1),
    size: Joi.number().empty('').default(20),
    search: Joi.string().empty(''),
    sort: Joi.string()
      .valid('id', 'createdAt', 'name', 'title', ...countSort)
      .empty('')
      .default('createdAt'),
    order: Joi.string().valid('asc', 'desc').empty('').default('desc'),
  })
    .unknown(true)
    .validateAsync(query);

  const skip = (page - 1) * (size || 20);

  const take = size;

  return {
    skip,
    take,
    sort,
    search,
    order: countSort.includes(sort) ? { _count: order } : order,
  };
}
