"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uncomment = exports.comment = exports.comments = void 0;
const Blog_1 = __importDefault(require("../../../model/Blog"));
const Comment_1 = __importDefault(require("../../../model/Comment"));
const asyncHandler = require('express-async-handler');
exports.comments = asyncHandler(async (req, res) => {
    const { comments } = res.locals.blog;
    const { pageSize } = req.query;
    const dataComments = await Comment_1.default.find({ _id: comments })
        .limit(Number(pageSize || 20))
        .populate('user', 'fullname image');
    try {
        return res.status(200).json({
            data: dataComments,
            count: await Comment_1.default.countDocuments({ _id: comments }),
            commentsCount: dataComments.length,
            message: 'Comments Fetched Successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.comment = asyncHandler(async (req, res) => {
    const { auth: { _id: authId }, blog: { _id: blogId, commentsCount }, } = res.locals;
    const { comment } = req.body;
    try {
        const { _id: commentId } = await Comment_1.default.create({
            blog: blogId,
            user: authId,
            comment,
        });
        await Blog_1.default.findByIdAndUpdate(blogId, {
            $push: { comments: commentId },
            commentsCount: commentsCount + 1,
        });
        return res.status(200).json({ message: 'Comment Successfull' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.uncomment = asyncHandler(async (req, res) => {
    const { _id: blogId, commentsCount } = res.locals.blog;
    const { commentId } = req.query;
    try {
        await Comment_1.default.findByIdAndDelete(commentId);
        await Blog_1.default.findByIdAndUpdate(blogId, {
            $pull: { comments: commentId },
            commentsCount: commentsCount - 1,
        });
        return res.status(200).json({ message: 'Comment Deleted Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
