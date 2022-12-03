"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blog = void 0;
const Blog_1 = __importDefault(require("../../model/Blog"));
const asyncHandler = require('express-async-handler');
exports.blog = asyncHandler(async (req, res) => {
    const { blogs } = res.locals.user;
    const { pageSize } = req.query;
    let query = { _id: blogs, isPublished: true };
    try {
        return res.status(200).json({
            data: await Blog_1.default.find(query)
                .sort({ likesCount: -1 })
                .limit(Number(pageSize || 20))
                .populate('author', 'fullname image'),
            count: await Blog_1.default.countDocuments(query),
            message: 'Blogs Fetched Successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
