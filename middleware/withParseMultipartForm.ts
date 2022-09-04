import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../interface/next';
import formidable from 'formidable';
import IFiles from '../interface/files';

const form = formidable({ multiples: true });

const withParseMultipartForm = (handler: NextApiHandler) => {
  return async (req: NextApiRequest & IFiles, res: NextApiResponse) => {
    const contentType = req.headers['content-type'];

    if (contentType && contentType.indexOf('multipart/form-data') !== -1) {
      form.parse(req, (err, fields, files) => {
        if (!err) {
          req.body = fields;
          req.files = files;
        }

        return handler(req, res);
      });
    } else {
      return handler(req, res);
    }
  };
};

export default withParseMultipartForm;
