import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../../../../model/User';
import middleware from '../../../../middleware/middleware';
import IMessage from '../../../../interface/message';

const handler = nextConnect();

handler.use(middleware);

handler.get(
  async (req: NextApiRequest, res: NextApiResponse<IMessage | { passwordResetLink: string }>) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ message: 'Invalid Email' });

      const token: string = jwt.sign(
        { _id: user._id },
        `${process.env.JWT_PASSWORD}${user.password}`,
        { expiresIn: '15min' }
      );

      const resetUrl = `https://blogsansar.vercel.app/reset-password/${user._id}/${token}`;

      const transporter = nodemailer.createTransport({
        //@ts-ignore
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
          user: process.env.MAILING_EMAIL,
          pass: process.env.APP_PASSWORD,
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

      return res.status(200).json({
        passwordResetLink: resetUrl,
      });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }
);

export default handler;
