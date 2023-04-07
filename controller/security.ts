import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { JwtPayload, verify, sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../model/User';
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');

export const resetLink = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'Invalid Email' });

  const token: string = sign({ _id: user._id }, `${process.env.JWT_PASSWORD}${user.password}`, {
    expiresIn: '15min',
  });

  const resetUrl = `${req.headers.origin}/security/reset-password/${user._id}/${token}`;

  const transporter = nodemailer.createTransport({
    //@ts-ignore
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user: process.env.MAILING_EMAIL,
      pass: process.env.MAILING_PASSWORD,
    },
    port: '465',
  });

  await transporter.sendMail({
    from: '"Do not reply to this email (via BlogSansar)" <blogsansar0@gmail.com>',
    to: email,
    subject: 'Password Reset Link',
    html: `
        <h1>Click on the link below to reset your password</h1>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      `,
  });

  return res.status(201).json({
    message: `Password reset link sent to ${email}`,
  });
});

export const resetPassword = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { token } = req.params;

    const { _id: userId } = res.locals.user;

    const { password, confirmPassword } = req.body;

    if (!token) return res.status(403).json({ message: 'Invalid token' });

    if (!password || password < 8)
      return res.status(403).json({ message: 'Password must contain atleast 8 characters' });

    if (password !== confirmPassword)
      return res.status(403).json({ message: 'Password does not match' });

    const user = await User.findById(userId).select('+password');

    if (!user) return res.status(404).json({ message: 'User does not exist' });

    const { _id } = verify(
      token as string,
      `${process.env.JWT_PASSWORD}${user.password}`
    ) as JwtPayload;

    const salt = await bcrypt.genSalt(10);

    const encryptedPassword: string = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(new mongoose.Types.ObjectId(_id), {
      password: encryptedPassword,
    });

    return res.status(201).json({ message: 'Password Reset Successful' });
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { _id: authId } = res.locals.auth;

    const { newPassword, confirmNewPassword } = req.body;

    if (!newPassword || newPassword < 8)
      return res.status(403).json({ message: 'Password must contain atleast 8 characters.' });

    if (newPassword !== confirmNewPassword)
      return res.status(403).json({ message: 'Password does not match' });

    const salt = await bcrypt.genSalt(10);

    const encryptedPassword: string = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(authId, { password: encryptedPassword });

    return res.status(201).json({ message: 'Password Change Successful' });
  }
);
