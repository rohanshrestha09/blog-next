"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfollow = exports.follow = void 0;
const User_1 = __importDefault(require("../../model/User"));
const Notification_1 = __importDefault(require("../../model/Notification"));
const socket_1 = require("../../socket");
const server_interface_1 = require("../../server.interface");
const asyncHandler = require('express-async-handler');
const { FOLLOW_USER } = server_interface_1.NOTIFICATION;
exports.follow = asyncHandler(async (req, res) => {
    const { auth: { _id: authId, fullname, followingCount }, user: { _id: userId, followersCount }, } = res.locals;
    if (authId.toString() === userId.toString())
        return res.status(403).json({ message: "Can't follow same user" });
    try {
        const followingExists = await User_1.default.findOne({
            $and: [{ _id: authId }, { following: userId }],
        });
        if (followingExists)
            return res.status(403).json({ message: 'Already Following' });
        await User_1.default.findByIdAndUpdate(authId, {
            $push: { following: userId },
            followingCount: followingCount + 1,
        });
        await User_1.default.findByIdAndUpdate(userId, {
            $push: { followers: authId },
            followersCount: followersCount + 1,
        });
        const { _id: notificationId } = await Notification_1.default.create({
            type: FOLLOW_USER,
            user: authId,
            listener: [userId],
            description: `${fullname} followed you.`,
        });
        (0, socket_1.dispatchNotification)({ listeners: [userId], notificationId });
        return res.status(200).json({ message: 'Follow Successful' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.unfollow = asyncHandler(async (req, res) => {
    const { auth: { _id: authId, followingCount }, user: { _id: userId, followersCount }, } = res.locals;
    if (authId.toString() === userId.toString())
        return res.status(403).json({ message: "Can't unfollow same user" });
    try {
        const followingExists = await User_1.default.findOne({
            $and: [{ _id: authId }, { following: userId }],
        });
        if (!followingExists)
            return res.status(403).json({ message: 'Not following' });
        await User_1.default.findByIdAndUpdate(authId, {
            $pull: { following: userId },
            followingCount: followingCount - 1,
        });
        await User_1.default.findByIdAndUpdate(userId, {
            $pull: { followers: authId },
            followersCount: followersCount - 1,
        });
        return res.status(200).json({ message: 'Unfollow Successful' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
