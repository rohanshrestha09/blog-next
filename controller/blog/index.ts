import { Request, Response } from 'express';
import { PipelineStage } from 'mongoose';
import uploadFile from '../../middleware/uploadFile';
import deleteFile from '../../middleware/deleteFile';
import Blog from '../../model/Blog';
import User from '../../model/User';
import Notification from '../../model/Notification';
import { NOTIFICATION } from '../../server.interface';
const asyncHandler = require('express-async-handler');

const { POST_BLOG } = NOTIFICATION;

export const blogs = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { sort, pageSize, genre, search } = req.query;

  const query: PipelineStage[] = [
    { $match: { isPublished: true } },
    { $sort: { [String(sort || 'likesCount')]: -1 } },
  ];

  if (genre) query.push({ $match: { genre: { $in: String(genre).split(',') } } });

  if (search)
    query.unshift({
      $search: {
        index: 'blog-search',
        autocomplete: { query: String(search), path: 'title' },
      },
    });

  try {
    const blogs = await Blog.aggregate([...query, { $limit: Number(pageSize || 20) }]);

    await User.populate(blogs, { path: 'author', select: 'fullname image' });

    const [{ totalCount } = { totalCount: 0 }] = await Blog.aggregate([
      ...query,
      { $count: 'totalCount' },
    ]);

    return res.status(200).json({
      data: blogs,
      count: totalCount,
      message: 'Blogs Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const blog = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  try {
    return res.status(200).json({ data: res.locals.blog, message: 'Blog Fetched Successfully' });
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

    await Notification.create({
      type: POST_BLOG,
      user: authId,
      listener: followers,
      blog: blogId,
      description: `${fullname} posted a new blog.`,
    });

    return res.status(200).json({ message: 'Blog Posted Successfully' });
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

    return res.status(200).json({ message: 'Blog Updated Successfully' });
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

    await User.findByIdAndUpdate(authId, { $pull: { blogs: blogId } });

    return res.status(200).json({ message: 'Blog Deleted Successfully' });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});

export const suggestions = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { pageSize } = req.query;

  try {
    const blogs = await Blog.aggregate([
      { $sample: { size: Number(pageSize || 4) } },
      { $match: { isPublished: true } },
    ]);

    await User.populate(blogs, { path: 'author', select: 'fullname image' });

    return res.status(200).json({
      data: blogs,
      count: await Blog.countDocuments({ isPublished: true }),
      message: 'Blogs Fetched Successfully',
    });
  } catch (err: Error | any) {
    return res.status(404).json({ message: err.message });
  }
});
