"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlike = exports.like = exports.likes = void 0;
const Blog_1 = __importDefault(require("../../model/Blog"));
const User_1 = __importDefault(require("../../model/User"));
const asyncHandler = require('express-async-handler');
exports.likes = asyncHandler(async (req, res) => {
    const { likers } = res.locals.blog;
    const { pageSize } = req.query;
    try {
        return res.status(200).json({
            data: await User_1.default.find({ _id: likers })
                .select('-password -email')
                .limit(Number(pageSize || 20)),
            count: await User_1.default.countDocuments({ _id: likers }),
            message: 'Likers fetched successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.like = asyncHandler(async (req, res) => {
    const { auth: { _id: authId }, blog: { _id: blogId, likesCount }, } = res.locals;
    try {
        const likeExist = await Blog_1.default.findOne({
            $and: [{ _id: blogId }, { likers: authId }],
        });
        if (likeExist)
            return res.status(403).json({ message: 'Already Liked' });
        await Blog_1.default.findByIdAndUpdate(blogId, {
            $push: { likers: authId },
            likesCount: likesCount + 1,
        });
        await User_1.default.findByIdAndUpdate(authId, {
            $push: { liked: blogId },
        });
        return res.status(200).json({ message: 'Liked' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.unlike = asyncHandler(async (req, res) => {
    const { auth: { _id: authId }, blog: { _id: blogId, likesCount }, } = res.locals;
    try {
        const likeExist = await Blog_1.default.findOne({
            $and: [{ _id: blogId }, { likers: authId }],
        });
        if (!likeExist)
            return res.status(403).json({ message: 'ALready Unliked' });
        await Blog_1.default.findByIdAndUpdate(blogId, {
            $pull: { likers: authId },
            likesCount: likesCount - 1,
        });
        await User_1.default.findByIdAndUpdate(authId, {
            $pull: { liked: blogId },
        });
        return res.status(200).json({ message: 'Unliked' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
