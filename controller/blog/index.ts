import { Request, Response } from 'express';
import uploadFile from '../../middleware/uploadFile';
import deleteFile from '../../middleware/deleteFile';
import Blog from '../../model/Blog';
import Comment from '../../model/Comment';
import Notification from '../../model/Notification';
import BlogLike from '../../model/BlogLike';
import UserFollow from '../../model/UserFollow';
import BlogBookmark from '../../model/BlogBookmark';
import CommentLike from '../../model/CommentLike';
import { dispatchNotification } from '../../socket';
import { NOTIFICATION } from '../../server.interface';
const asyncHandler = require('express-async-handler');

const { POST_BLOG } = NOTIFICATION;

export const blogs = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { sort, size, genre, search } = req.query;

  let query = { isPublished: true };

  if (genre) query = Object.assign({ genre: { $in: String(genre).split(',') } }, query);

  const data = await Blog.findMany({
    match: query,
    search,
    limit: Number(size),
    sort: { field: String(sort || 'likeCount'), order: -1 },
  });

  return res.status(200).json({
    ...data,
    message: 'Blogs Fetched Successfully',
  });
});

export const blog = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const {
    blog: { _id: blogId },
    viewer: { _id: viewer },
  } = res.locals;

  return res.status(200).json({
    data: await Blog.findUnique({ _id: blogId, viewer }),
    message: 'Blog Fetched Successfully',
  });
});

export const postBlog = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: authId, fullname } = res.locals.auth;

  const { title, content, genre, isPublished } = req.body;

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

  const followers = (await UserFollow.find({ follows: authId })).map(({ follows }) =>
    follows.toString()
  );

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

  return res.status(201).json({ blog: blogId, message: 'Blog Posted Successfully' });
});

export const updateBlog = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: blogId, image, imageName } = res.locals.blog;

  const { title, content, genre } = req.body;

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

  return res.status(201).json({ blog: blogId, message: 'Blog Updated Successfully' });
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: blogId, image, imageName } = res.locals.blog;

  if (image && imageName) deleteFile(`blogs/${imageName}`);

  await Blog.findByIdAndDelete(blogId);

  await BlogLike.deleteMany({ likes: blogId });

  await BlogBookmark.deleteMany({ bookmarks: blogId });

  const comments = (await Comment.find({ blog: blogId })).map(({ blog }) => blog.toString());

  await Comment.deleteMany({ blog: blogId });

  await CommentLike.deleteMany({ likes: { $in: comments } });

  await Notification.deleteMany({ blog: blogId });

  return res.status(201).json({ message: 'Blog Deleted Successfully' });
});

export const suggestions = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { _id: viewer } = res.locals.viewer;

  const { size } = req.query;

  const data = await Blog.findMany({
    match: { isPublished: true },
    viewer,
    sample: true,
    limit: Number(size || 4),
  });

  return res.status(200).json({
    ...data,
    message: 'Blogs Fetched Successfully',
  });
});
