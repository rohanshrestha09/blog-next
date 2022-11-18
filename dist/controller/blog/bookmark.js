"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unbookmark = exports.bookmark = void 0;
const User_1 = __importDefault(require("../../model/User"));
const asyncHandler = require('express-async-handler');
exports.bookmark = asyncHandler(async (req, res) => {
    const { auth: { _id: authId }, blog: { _id: blogId }, } = res.locals;
    try {
        const bookmarkExist = await User_1.default.findOne({
            $and: [{ _id: authId }, { bookmarks: blogId }],
        });
        if (bookmarkExist)
            return res.status(403).json({ message: 'Already Bookmarked' });
        await User_1.default.findByIdAndUpdate(authId, { $push: { bookmarks: blogId } });
        return res.status(200).json({ message: 'Bookmarked Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.unbookmark = asyncHandler(async (req, res) => {
    const { auth: { _id: authId }, blog: { _id: blogId }, } = res.locals;
    try {
        const bookmarkExist = await User_1.default.findOne({
            $and: [{ _id: authId }, { bookmarks: blogId }],
        });
        if (!bookmarkExist)
            return res.status(403).json({ message: 'Already Unbookmarked' });
        await User_1.default.findByIdAndUpdate(authId, { $pull: { bookmarks: blogId } });
        return res.status(200).json({ message: 'Unbookmarked Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
