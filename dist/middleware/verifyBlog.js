"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Blog_1 = __importDefault(require("../model/Blog"));
const asyncHandler = require('express-async-handler');
exports.default = asyncHandler(async (req, res, next) => {
    const { blog: blogId } = req.params || req.query;
    try {
        const blog = await Blog_1.default.findById(blogId).populate('author', 'fullname image');
        if (!blog)
            return res.status(404).json({ message: 'Blog does not exist' });
        res.locals.blog = blog;
        next();
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
