import { Response, Request, NextFunction } from 'express';
import User from '../model/User';
const asyncHandler = require('express-async-handler');

export default asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    const { user: userId } = req.params || req.query;

    try {
      const user = await User.findUnique({ _id: userId, exclude: ['email', 'password'] }).catch(
        (err) => next(err)
      );

      if (!user) return res.status(404).json({ message: 'User does not exist' });

      res.locals.user = user;

      next();
    } catch (err) {
      next(err);
    }
  }
);
