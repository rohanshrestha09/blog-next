import { NextApiRequest, NextApiResponse } from 'next';
import NextApiHandler from '../../../../interface/next';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import init from '../../../../middleware/init';
import User from '../../../../model/User';
import IMessage from '../../../../interface/message';

init();

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<IMessage | { passwordResetLink: string }>
) => {
  const { method } = req;

  if (method === 'GET') {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ message: 'Invalid Email' });

      const token: string = jwt.sign(
        { _id: user._id },
        `${process.env.JWT_PASSWORD}${user.password}`,
        { expiresIn: '15min' }
      );

      const resetUrl = `https://blogsansar.vercel.app/security/reset-password/${user._id}/${token}`;

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

      return res.status(200).json({
        message: `Password reset link sent to ${email}`,
      });
    } catch (err: Error | any) {
      return res.status(404).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default handler;
