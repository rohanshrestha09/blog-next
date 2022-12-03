"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestions = exports.deleteBlog = exports.updateBlog = exports.postBlog = exports.blog = exports.blogs = void 0;
const uploadFile_1 = __importDefault(require("../../middleware/uploadFile"));
const deleteFile_1 = __importDefault(require("../../middleware/deleteFile"));
const Blog_1 = __importDefault(require("../../model/Blog"));
const User_1 = __importDefault(require("../../model/User"));
const Notification_1 = __importDefault(require("../../model/Notification"));
const socket_1 = require("../../socket");
const server_interface_1 = require("../../server.interface");
const asyncHandler = require('express-async-handler');
const { POST_BLOG } = server_interface_1.NOTIFICATION;
exports.blogs = asyncHandler(async (req, res) => {
    const { sort, pageSize, genre, search } = req.query;
    const query = [
        { $match: { isPublished: true } },
        { $sort: { [String(sort || 'likesCount')]: -1 } },
    ];
    if (sort === 'likesCount')
        query.push({ $sort: { createdAt: 1 } });
    if (genre)
        query.push({ $match: { genre: { $in: String(genre).split(',') } } });
    if (search)
        query.unshift({
            $search: {
                index: 'blog-search',
                autocomplete: { query: String(search), path: 'title' },
            },
        });
    try {
        const blogs = await Blog_1.default.aggregate([...query, { $limit: Number(pageSize || 20) }]);
        await User_1.default.populate(blogs, { path: 'author', select: 'fullname image' });
        const [{ totalCount } = { totalCount: 0 }] = await Blog_1.default.aggregate([
            ...query,
            { $count: 'totalCount' },
        ]);
        return res.status(200).json({
            data: blogs,
            count: totalCount,
            message: 'Blogs Fetched Successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.blog = asyncHandler(async (req, res) => {
    try {
        return res.status(200).json({ data: res.locals.blog, message: 'Blog Fetched Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.postBlog = asyncHandler(async (req, res) => {
    const { _id: authId, fullname, followers } = res.locals.auth;
    const { title, content, genre, isPublished } = req.body;
    try {
        const { _id: blogId } = await Blog_1.default.create({
            author: authId,
            title,
            content,
            genre,
            isPublished,
        });
        if (req.files) {
            const file = req.files.image;
            if (!file.mimetype.startsWith('image/'))
                return res.status(403).json({ message: 'Please choose an image' });
            const filename = file.mimetype.replace('image/', `${blogId}.`);
            const fileUrl = await (0, uploadFile_1.default)(file.data, file.mimetype, `blogs/${filename}`);
            await Blog_1.default.findByIdAndUpdate(blogId, {
                image: fileUrl,
                imageName: filename,
            });
        }
        await User_1.default.findByIdAndUpdate(authId, { $push: { blogs: blogId } });
        if (isPublished) {
            const { id: notificationId } = await Notification_1.default.create({
                type: POST_BLOG,
                user: authId,
                listener: followers,
                blog: blogId,
                description: `${fullname} posted a new blog.`,
            });
            (0, socket_1.dispatchNotification)({ listeners: [followers], notificationId });
        }
        return res.status(200).json({ message: 'Blog Posted Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.updateBlog = asyncHandler(async (req, res) => {
    const { _id: blogId, image, imageName } = res.locals.blog;
    const { title, content, genre } = req.body;
    try {
        if (req.files) {
            const file = req.files.image;
            if (!file.mimetype.startsWith('image/'))
                return res.status(403).json({ message: 'Please choose an image' });
            if (image && imageName)
                (0, deleteFile_1.default)(`blogs/${imageName}`);
            const filename = file.mimetype.replace('image/', `${blogId}.`);
            const fileUrl = await (0, uploadFile_1.default)(file.data, file.mimetype, `blogs/${filename}`);
            await Blog_1.default.findByIdAndUpdate(blogId, {
                image: fileUrl,
                imageName: filename,
            });
        }
        await Blog_1.default.findByIdAndUpdate(blogId, {
            title,
            content,
            genre,
        });
        return res.status(200).json({ message: 'Blog Updated Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.deleteBlog = asyncHandler(async (req, res) => {
    const { _id: authId } = res.locals.auth;
    const { _id: blogId, image, imageName } = res.locals.blog;
    try {
        if (image && imageName)
            (0, deleteFile_1.default)(`blogs/${imageName}`);
        await Blog_1.default.findByIdAndDelete(blogId);
        await User_1.default.findByIdAndUpdate(authId, { $pull: { blogs: blogId } });
        return res.status(200).json({ message: 'Blog Deleted Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.suggestions = asyncHandler(async (req, res) => {
    const { pageSize } = req.query;
    try {
        const blogs = await Blog_1.default.aggregate([
            { $sample: { size: Number(pageSize || 4) } },
            { $match: { isPublished: true } },
        ]);
        await User_1.default.populate(blogs, { path: 'author', select: 'fullname image' });
        return res.status(200).json({
            data: blogs,
            count: await Blog_1.default.countDocuments({ isPublished: true }),
            message: 'Blogs Fetched Successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
