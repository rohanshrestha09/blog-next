import { NextFunction, Request, Response } from 'express';
import { JwtPayload, Secret, verify } from 'jsonwebtoken';
import User from '../model/User';
const asyncHandler = require('express-async-handler');

export default asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    const { token } = req.cookies;

    try {
      if (token) {
        const { _id } = verify(token, process.env.JWT_TOKEN as Secret) as JwtPayload;

        const viewer = await User.findUnique({ _id, exclude: ['password', 'email'] });

        if (!viewer) return res.status(404).json({ message: 'User does not exist' });

        res.locals.viewer = viewer;
      } else {
        res.locals.viewer = { _id: null };
      }

      next();
    } catch (err) {
      next(err);
    }
  }
);
