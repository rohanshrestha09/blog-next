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
exports.uncomment = exports.comment = exports.comments = void 0;
const Blog_1 = __importDefault(require("../../../model/Blog"));
const Comment_1 = __importDefault(require("../../../model/Comment"));
const asyncHandler = require('express-async-handler');
exports.comments = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { comments } = res.locals.blog;
    const { pageSize } = req.query;
    const dataComments = yield Comment_1.default.find({ _id: comments })
        .limit(Number(pageSize || 20))
        .populate('user', 'fullname image');
    try {
        return res.status(200).json({
            data: dataComments,
            count: yield Comment_1.default.countDocuments({ _id: comments }),
            commentsCount: dataComments.length,
            message: 'Comments Fetched Successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.comment = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auth: { _id: authId }, blog: { _id: blogId, commentsCount }, } = res.locals;
    const { comment } = req.body;
    try {
        const { _id: commentId } = yield Comment_1.default.create({
            blog: blogId,
            user: authId,
            comment,
        });
        yield Blog_1.default.findByIdAndUpdate(blogId, {
            $push: { comments: commentId },
            commentsCount: commentsCount + 1,
        });
        return res.status(200).json({ message: 'Comment Successfull' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.uncomment = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: blogId, commentsCount } = res.locals.blog;
    const { commentId } = req.query;
    try {
        yield Comment_1.default.findByIdAndDelete(commentId);
        yield Blog_1.default.findByIdAndUpdate(blogId, {
            $pull: { comments: commentId },
            commentsCount: commentsCount - 1,
        });
        return res.status(200).json({ message: 'Comment Deleted Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
