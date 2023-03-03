import { Request, Response, NextFunction } from 'express';
import Blog from '../model/Blog';
const asyncHandler = require('express-async-handler');

export default asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    const { blog: blogId } = req.params || req.query;

    try {
      const blog = await Blog.findUnique({ _id: blogId });

      if (!blog) return res.status(404).json({ message: 'Blog does not exist' });

      res.locals.blog = blog;

      next();
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);
