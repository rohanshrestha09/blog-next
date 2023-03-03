import { NextFunction, Request, Response } from 'express';
import { JwtPayload, Secret, verify } from 'jsonwebtoken';
import User from '../model/User';
const asyncHandler = require('express-async-handler');

export default asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: 'Not authorised' });

    try {
      const { _id } = verify(token, process.env.JWT_TOKEN as Secret) as JwtPayload;

      const auth = await User.findUnique({ _id, exclude: ['password'] });

      if (!auth) return res.status(404).json({ message: 'User does not exist' });

      res.locals.auth = auth;

      next();
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);
