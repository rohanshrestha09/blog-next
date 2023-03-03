import { Request, Response } from 'express';
import uploadFile from '../../middleware/uploadFile';
import deleteFile from '../../middleware/deleteFile';
import Blog from '../../model/Blog';
import User from '../../model/User';
import Comment from '../../model/Comment';
import Notification from '../../model/Notification';
import { dispatchNotification } from '../../socket';
import { NOTIFICATION } from '../../server.interface';
const asyncHandler = require('express-async-handler');

const { POST_BLOG } = NOTIFICATION;

export const blogs = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { sort, size, genre, search } = req.query;

  let query = { isPublished: true };

  if (genre) query = Object.assign({ genre: { $in: String(genre).split(',') } }, query);

  try {
    const data = await Blog.findMany({
      match: query,
      search,
      limit: Number(size),
      sort: { field: String(sort || 'like'), order: -1 },
    });

    return res.status(200).json({
      ...data,
      message: 'Blogs Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const blog = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  try {
    return res.status(200).json({
      data: res.locals.blog,
      message: 'Blog Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const postBlog = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: authId, fullname, followers } = res.locals.auth;

  const { title, content, genre, isPublished } = req.body;

  try {
    const { _id: blogId } = await Blog.create({
      author: authId,
      title,
      content,
      genre,
      isPublished,
    });

    if (req.files) {
      const file = req.files.image as any;

      if (!file.mimetype.startsWith('image/'))
        return res.status(403).json({ message: 'Please choose an image' });

      const filename = file.mimetype.replace('image/', `${blogId}.`);

      const fileUrl = await uploadFile(file.data, file.mimetype, `blogs/${filename}`);

      await Blog.findByIdAndUpdate(blogId, {
        image: fileUrl,
        imageName: filename,
      });
    }

    await User.findByIdAndUpdate(authId, { $push: { blogs: blogId } });

    if (isPublished) {
      const { id: notificationId } = await Notification.create({
        type: POST_BLOG,
        user: authId,
        listener: followers,
        blog: blogId,
        description: `${fullname} posted a new blog.`,
      });

      dispatchNotification({ listeners: followers, notificationId });
    }

    return res.status(200).json({ blog: blogId, message: 'Blog Posted Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const updateBlog = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: blogId, image, imageName } = res.locals.blog;

  const { title, content, genre } = req.body;

  try {
    if (req.files) {
      const file = req.files.image as any;

      if (!file.mimetype.startsWith('image/'))
        return res.status(403).json({ message: 'Please choose an image' });

      if (image && imageName) deleteFile(`blogs/${imageName}`);

      const filename = file.mimetype.replace('image/', `${blogId}.`);

      const fileUrl = await uploadFile(file.data, file.mimetype, `blogs/${filename}`);

      await Blog.findByIdAndUpdate(blogId, {
        image: fileUrl,
        imageName: filename,
      });
    }

    await Blog.findByIdAndUpdate(blogId, {
      title,
      content,
      genre,
    });

    return res.status(200).json({ blog: blogId, message: 'Blog Updated Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: authId } = res.locals.auth;

  const { _id: blogId, image, imageName } = res.locals.blog;

  try {
    if (image && imageName) deleteFile(`blogs/${imageName}`);

    await Blog.findByIdAndDelete(blogId);

    await Comment.deleteMany({ blog: blogId });

    await User.findByIdAndUpdate(authId, { $pull: { blogs: blogId } });

    return res.status(200).json({ message: 'Blog Deleted Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const suggestions = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { size } = req.query;

  try {
    const data = await Blog.findMany({
      match: { isPublished: true },
      sample: true,
      limit: Number(size || 4),
    });

    return res.status(200).json({
      ...data,
      message: 'Blogs Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
