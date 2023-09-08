import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { sign } from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { prisma } from 'lib/prisma';
import { errorHandler } from 'utils/exception';
import { httpResponse } from 'utils/response';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });

  const token = sign(
    { id: user.id, email: user.email },
    `${process.env.JWT_PASSWORD}${user.password}`,
    {
      expiresIn: '15min',
    },
  );

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/security/reset-password/${user.email}/${token}`;

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

  return res.status(201).json(httpResponse(`Password reset link sent to ${email}`));
});

export default router.handler({ onError: errorHandler });
