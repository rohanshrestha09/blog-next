import { Request, Response } from 'express';
import { genre as genreCollection } from '../../misc';
const asyncHandler = require('express-async-handler');

export const genre = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  res.setHeader('Cache-Control', 'public,max-age=86400');

  return res.status(200).json({ data: genreCollection, message: 'Genre Fetched Successfully' });
});
