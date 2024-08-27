import { NextApiRequest } from 'next';
import Joi from 'joi';
import multiparty from 'multiparty';
import { FilterProps, MultipartyFile } from 'server/utils/types';

export const parseFormData = async <T>(req: NextApiRequest) => {
  const form = new multiparty.Form();

  const data = await new Promise((resolve, reject) => {
    form.parse(req, function (err, fields, files) {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  const { fields, files } = data as { fields: { [x: string]: string[] }; files: any };

  const parsedFields = Object.entries(fields)
    .map(([k, v]) => ({ [k]: v.length === 1 ? v[0] : v }))
    .reduce((prev, curr) => ({ ...prev, ...curr }));

  return { fields: parsedFields, files } as { fields: T; files: MultipartyFile[] };
};

export async function parseQuery(query: NextApiRequest['query']): Promise<FilterProps> {
  const { page, size, search, sort, order } = await Joi.object({
    page: Joi.number().empty('').default(1),
    size: Joi.number().empty('').default(20),
    search: Joi.string().empty(''),
    sort: Joi.string().empty('').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').empty('').default('desc'),
  })
    .unknown(true)
    .validateAsync(query);

  return { page, size, sort, order, search };
}
