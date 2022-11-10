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
exports.suggestions = exports.deleteBlog = exports.updateBlog = exports.postBlog = exports.blog = exports.blogs = void 0;
const uploadFile_1 = __importDefault(require("../../middleware/uploadFile"));
const deleteFile_1 = __importDefault(require("../../middleware/deleteFile"));
const Blog_1 = __importDefault(require("../../model/Blog"));
const User_1 = __importDefault(require("../../model/User"));
const asyncHandler = require('express-async-handler');
exports.blogs = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sort, pageSize, genre, search } = req.query;
    const query = [
        { $match: { isPublished: true } },
        { $sort: { [String(sort || 'likes')]: -1 } },
    ];
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
exports.blog = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.status(200).json({ data: res.locals.blog, message: 'Blog Fetched Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.postBlog = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: authId } = res.locals.auth;
    const { title, content, genre, isPublished } = req.body;
    try {
        const { _id: blogId } = yield Blog_1.default.create({
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
            const fileUrl = yield (0, uploadFile_1.default)(file.data, file.mimetype, `blogs/${filename}`);
            yield Blog_1.default.findByIdAndUpdate(blogId, {
                image: fileUrl,
                imageName: filename,
            });
        }
        yield User_1.default.findByIdAndUpdate(authId, { $push: { blogs: blogId } });
        return res.status(200).json({ message: 'Blog Posted Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.updateBlog = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            const fileUrl = yield (0, uploadFile_1.default)(file.data, file.mimetype, `blogs/${filename}`);
            yield Blog_1.default.findByIdAndUpdate(blogId, {
                image: fileUrl,
                imageName: filename,
            });
        }
        yield Blog_1.default.findByIdAndUpdate(blogId, {
            title,
            content,
            genre,
        });
        return res.status(200).json({ message: 'Blog Updated Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.deleteBlog = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: authId } = res.locals.auth;
    const { _id: blogId, image, imageName } = res.locals.blog;
    try {
        if (image && imageName)
            (0, deleteFile_1.default)(`blogs/${imageName}`);
        yield Blog_1.default.findByIdAndDelete(blogId);
        yield User_1.default.findByIdAndUpdate(authId, { $pull: { blogs: blogId } });
        return res.status(200).json({ message: 'Blog Deleted Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.suggestions = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize } = req.query;
    const blogs = yield Blog_1.default.aggregate([
        { $sample: { size: Number(pageSize || 4) } },
        { $match: { isPublished: true } },
    ]);
    yield User_1.default.populate(blogs, { path: 'author', select: 'fullname image' });
    try {
        return res.status(200).json({
            data: blogs,
            count: yield Blog_1.default.countDocuments({ isPublished: true }),
            message: 'Blogs Fetched Successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
