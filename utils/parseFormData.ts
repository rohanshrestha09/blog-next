import { NextApiRequest } from 'next';
import multiparty from 'multiparty';

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

  return { fields: parsedFields, files } as { fields: T; files: any };
};
