import { NextApiRequest, NextApiResponse } from 'next';
import { NextFunction } from 'express';
import formidable from 'formidable';

const form = formidable({ multiples: false });

const parseMultipartForm = async (
  req: NextApiRequest & { files: any },
  res: NextApiResponse,
  next: NextFunction
) => {
  const contentType = req.headers['content-type'];
  if (contentType && contentType.indexOf('multipart/form-data') !== -1) {
    form.parse(req, (err, fields, files) => {
      if (!err) {
        req.body = fields;
        req.files = files;
      }
      next();
    });
  } else {
    next();
  }
};

export default parseMultipartForm;
