import { Request, Response, NextFunction } from 'express';
const asyncHandler = require('express-async-handler');

export default asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      const { auth, blog } = res.locals;

      if (auth._id.toString() !== blog.author._id.toString())
        return res.status(401).json({ message: 'Unauthorized action' });

      next();
    } catch (err) {
      next(err);
    }
  }
);
