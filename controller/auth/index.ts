import { Request, Response } from 'express';
import moment from 'moment';
import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';
import uploadFile from '../../middleware/uploadFile';
import deleteFile from '../../middleware/deleteFile';
import User from '../../model/User';
import Blog from '../../model/Blog';
import Notification from '../../model/Notification';
import Comment from '../../model/Comment';
import UserFollow from '../../model/UserFollow';
import BlogLike from '../../model/BlogLike';
import BlogBookmark from '../../model/BlogBookmark';
import CommentLike from '../../model/CommentLike';
const asyncHandler = require('express-async-handler');

moment.suppressDeprecationWarnings = true;

export const authHandler = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).json({
    data: res.locals.auth,
    message: 'Authentication Successful',
  });
});

export const completeAuth = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { password, confirmPassword } = req.body;

  const { _id: authId } = res.locals.auth;

  if (!password || password < 8)
    return res.status(403).json({ message: 'Password must contain atleast 8 characters.' });

  if (password !== confirmPassword)
    return res.status(403).json({ message: 'Password does not match.' });

  const salt = await bcrypt.genSalt(10);

  const encryptedPassword: string = await bcrypt.hash(password, salt);

  await User.findByIdAndUpdate(authId, { password: encryptedPassword, verified: true });

  return res.status(201).json({ message: 'Profile Completed' });
});

export const updateProfile = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { _id: authId, image, imageName } = res.locals.auth;

    const { fullname, bio, website, dateOfBirth } = req.body;

    if (req.files) {
      const file = req.files.image as any;

      if (!file.mimetype.startsWith('image/'))
        return res.status(403).json({ message: 'Please choose an image' });

      if (image && imageName) deleteFile(`users/${imageName}`);

      const filename = file.mimetype.replace('image/', `${authId}.`);

      const fileUrl = await uploadFile(file.data, file.mimetype, `users/${filename}`);

      await User.findByIdAndUpdate(authId, {
        image: fileUrl,
        imageName: filename,
      });
    }

    await User.findByIdAndUpdate(authId, {
      fullname,
      bio,
      website,
      dateOfBirth: new Date(moment(dateOfBirth).format()),
    });

    return res.status(201).json({ message: 'Profile Updated Successfully' });
  }
);

export const deleteImage = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: authId, image, imageName } = res.locals.auth;

  if (image && imageName) deleteFile(imageName);

  await User.findByIdAndUpdate(authId, {
    image: null,
    imageName: null,
  });

  return res.status(201).json({ message: 'Profile Image Removed Successfully' });
});

export const deleteProfile = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { _id: authId, image, imageName } = res.locals.auth;

    const blogs = await Blog.find({ author: authId });
    if (blogs?.length) {
      const allBlogs = await Blog.find({ _id: blogs });

      allBlogs?.forEach((blog) => {
        if (blog?.image && blog.imageName) deleteFile(`blogs/${blog.imageName}`);
      });

      await Blog.deleteMany({ author: authId });
    }

    await Notification.deleteMany({ user: authId });

    await Comment.deleteMany({ user: authId });

    await UserFollow.deleteMany({ $or: [{ user: authId }, { follows: authId }] });

    await BlogLike.deleteMany({ user: authId });

    await BlogBookmark.deleteMany({ user: authId });

    await CommentLike.deleteMany({ user: authId });

    if (image && imageName) deleteFile(`users/${imageName}`);

    await User.findByIdAndDelete(authId);

    const serialized = serialize('token', '', {
      maxAge: 0,
      path: '/',
    });

    res.setHeader('Set-Cookie', serialized);

    return res.status(201).json({ message: 'Profile Deleted Successfully' });
  }
);

export const logout = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  res.clearCookie('token');

  return res.status(201).json({ message: 'Logout Successful' });
});
