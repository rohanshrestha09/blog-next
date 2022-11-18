"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpublish = exports.publish = void 0;
const Blog_1 = __importDefault(require("../../model/Blog"));
const asyncHandler = require('express-async-handler');
exports.publish = asyncHandler(async (req, res) => {
    const { _id: blogId } = res.locals.blog;
    try {
        await Blog_1.default.findByIdAndUpdate(blogId, { isPublished: true });
        return res.status(200).json({ message: 'Blog Published Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.unpublish = asyncHandler(async (req, res) => {
    const { _id: blogId } = res.locals.blog;
    try {
        await Blog_1.default.findByIdAndUpdate(blogId, { isPublished: false });
        return res.status(200).json({ message: 'Blog Unpublished Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
