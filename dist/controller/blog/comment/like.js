"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikeComment = exports.likeComment = void 0;
const Comment_1 = __importDefault(require("../../../model/Comment"));
const Notification_1 = __importDefault(require("../../../model/Notification"));
const socket_1 = require("../../../socket");
const server_interface_1 = require("../../../server.interface");
const asyncHandler = require('express-async-handler');
const { LIKE_COMMENT } = server_interface_1.NOTIFICATION;
exports.likeComment = asyncHandler(async (req, res) => {
    const { _id: authId, fullname } = res.locals.auth;
    const { commentId } = req.query;
    try {
        const likeExist = await Comment_1.default.findOne({
            $and: [{ _id: commentId }, { likers: authId }],
        });
        if (likeExist)
            return res.status(403).json({ message: 'Already Liked' });
        const comment = await Comment_1.default.findById(commentId);
        if (!comment)
            return res.status(404).json({ message: 'Comment does not exist' });
        comment.likesCount += 1;
        comment.likers.push(authId);
        await comment.save();
        const { _id: notificationId } = await Notification_1.default.create({
            type: LIKE_COMMENT,
            user: authId,
            listener: comment.user,
            blog: comment.blog,
            comment: commentId,
            description: `${fullname} liked your comment.`,
        });
        (0, socket_1.dispatchNotification)({ listeners: [comment.user.toString()], notificationId });
        return res.status(200).json({ message: 'Liked' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.unlikeComment = asyncHandler(async (req, res) => {
    const { _id: authId } = res.locals.auth;
    const { commentId } = req.query;
    try {
        const likeExist = await Comment_1.default.findOne({
            $and: [{ _id: commentId }, { likers: authId }],
        });
        if (!likeExist)
            return res.status(403).json({ message: 'ALready Unliked' });
        const comment = await Comment_1.default.findById(commentId);
        if (!comment)
            return res.status(404).json({ message: 'Comment does not exist' });
        comment.likesCount -= 1;
        comment.likers = comment.likers.filter((likers) => likers.toString() !== authId.toString());
        await comment.save();
        return res.status(200).json({ message: 'Unliked' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
