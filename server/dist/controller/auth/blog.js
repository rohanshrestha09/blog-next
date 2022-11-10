"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.followingBlogs = exports.bookmarks = exports.blogs = void 0;
const Blog_1 = __importDefault(require("../../model/Blog"));
const User_1 = __importDefault(require("../../model/User"));
const asyncHandler = require('express-async-handler');
exports.blogs = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const blogs = yield Blog_1.default.aggregate([...query, { $limit: Number(pageSize || 20) }]);
    yield User_1.default.populate(blogs, { path: 'author', select: 'fullname image' });
    const [{ totalCount } = { totalCount: 0 }] = yield Blog_1.default.aggregate([
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
}));
exports.bookmarks = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const blogs = yield Blog_1.default.aggregate([...query, { $limit: Number(pageSize || 20) }]);
    yield User_1.default.populate(blogs, { path: 'author', select: 'fullname image' });
    const [{ totalCount } = { totalCount: 0 }] = yield Blog_1.default.aggregate([
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
}));
exports.followingBlogs = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { following } = res.locals.auth;
    const { pageSize } = req.query;
    let query = { author: following, isPublished: true };
    try {
        return res.status(200).json({
            data: yield Blog_1.default.find(query)
                .limit(Number(pageSize || 20))
                .populate('author', 'fullname image'),
            count: yield Blog_1.default.countDocuments(query),
            message: 'Following Blogs Fetched Successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
