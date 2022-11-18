"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.followingBlogs = exports.bookmarks = exports.blogs = void 0;
const Blog_1 = __importDefault(require("../../model/Blog"));
const User_1 = __importDefault(require("../../model/User"));
const asyncHandler = require('express-async-handler');
exports.blogs = asyncHandler(async (req, res) => {
    const { blogs: blogIds } = res.locals.auth;
    const { sort, sortOrder, pageSize, genre, isPublished, search } = req.query;
    const query = [
        { $match: { _id: { $in: blogIds } } },
        { $sort: { [String(sort || 'likes')]: sortOrder === 'asc' ? 1 : -1 } },
    ];
    if (genre)
        query.push({ $match: { genre: { $in: String(genre).split(',') } } });
    if (isPublished)
        query.push({ $match: { isPublished: isPublished === 'true' } });
    if (search)
        query.unshift({
            $search: {
                index: 'blog-search',
                autocomplete: { query: String(search), path: 'title' },
            },
        });
    const blogs = await Blog_1.default.aggregate([...query, { $limit: Number(pageSize || 20) }]);
    await User_1.default.populate(blogs, { path: 'author', select: 'fullname image' });
    const [{ totalCount } = { totalCount: 0 }] = await Blog_1.default.aggregate([
        ...query,
        { $count: 'totalCount' },
    ]);
    try {
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
exports.bookmarks = asyncHandler(async (req, res) => {
    const { bookmarks } = res.locals.auth;
    const { pageSize, genre, search } = req.query;
    const query = [{ $match: { _id: { $in: bookmarks }, isPublished: true } }];
    if (genre)
        query.push({ $match: { genre: { $in: String(genre).split(',') } } });
    if (search)
        query.unshift({
            $search: {
                index: 'blog-search',
                autocomplete: { query: String(search), path: 'title' },
            },
        });
    const blogs = await Blog_1.default.aggregate([...query, { $limit: Number(pageSize || 20) }]);
    await User_1.default.populate(blogs, { path: 'author', select: 'fullname image' });
    const [{ totalCount } = { totalCount: 0 }] = await Blog_1.default.aggregate([
        ...query,
        { $count: 'totalCount' },
    ]);
    try {
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
exports.followingBlogs = asyncHandler(async (req, res) => {
    const { following } = res.locals.auth;
    const { pageSize } = req.query;
    let query = { author: following, isPublished: true };
    try {
        return res.status(200).json({
            data: await Blog_1.default.find(query)
                .limit(Number(pageSize || 20))
                .populate('author', 'fullname image'),
            count: await Blog_1.default.countDocuments(query),
            message: 'Following Blogs Fetched Successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
