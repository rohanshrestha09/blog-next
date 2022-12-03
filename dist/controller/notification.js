"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.notifications = void 0;
const Notification_1 = __importDefault(require("../model/Notification"));
const server_interface_1 = require("../server.interface");
const asyncHandler = require('express-async-handler');
const { READ, UNREAD } = server_interface_1.NOTIFICATION_STATUS;
exports.notifications = asyncHandler(async (req, res) => {
    const { _id: authId } = res.locals.auth;
    const { pageSize } = req.query;
    try {
        return res.status(200).json({
            data: await Notification_1.default.find({ listener: { $in: authId } })
                .sort({ createdAt: -1 })
                .limit(Number(pageSize || 20))
                .populate('user', 'fullname image')
                .populate('blog', 'title image')
                .populate('comment', 'comment'),
            count: await Notification_1.default.countDocuments({ listener: { $in: authId } }),
            read: await Notification_1.default.countDocuments({
                $and: [{ listener: { $in: authId } }, { status: READ }],
            }),
            unread: await Notification_1.default.countDocuments({
                $and: [{ listener: { $in: authId } }, { status: UNREAD }],
            }),
            message: 'Notifications fetched successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.markAsRead = asyncHandler(async (req, res) => {
    const { notification: notificationId } = req.params;
    try {
        await Notification_1.default.findByIdAndUpdate(notificationId, { status: READ });
        return res.status(200).json({ message: 'Notification updated successfully' });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
});
exports.markAllAsRead = asyncHandler(async (req, res) => {
    try {
        await Notification_1.default.updateMany({}, { status: READ });
        return res.status(200).json({ message: 'Notifications updated successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
