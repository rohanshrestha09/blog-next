"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FollowNotifSchema = new mongoose_1.Schema({
    type: 'followUser',
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Follower Missing'],
    },
    listener: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Listener Missing'],
    },
    status: {
        type: String,
        enum: {
            values: ['read', 'unread'],
            message: '{VALUE} not supported',
        },
        default: 'unread',
    },
}, { timestamps: true });
const BlogNotifSchema = new mongoose_1.Schema({
    type: 'blogLike',
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Follower Missing'],
    },
    listener: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Listener Missing'],
    },
    blog: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Blog',
        required: [true, 'Blog Missing'],
    },
    status: {
        type: String,
        enum: {
            values: ['read', 'unread'],
            message: '{VALUE} not supported',
        },
        default: 'unread',
    },
}, { timestamps: true });
const CommentNotifSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: [true, 'Notification type required'],
        enum: {
            values: ['commentLike', 'commentPost'],
            message: '{VALUE} not supported',
        },
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Follower Missing'],
    },
    listener: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Listener Missing'],
    },
    comment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Comment',
        required: [true, 'Comment Missing'],
    },
    status: {
        type: String,
        enum: {
            values: ['read', 'unread'],
            message: '{VALUE} not supported',
        },
        default: 'unread',
    },
}, { timestamps: true });
const FollowingNotifSchema = new mongoose_1.Schema({
    type: 'blogFollowing',
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Follower Missing'],
    },
    listener: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'User',
        required: [true, 'Listener Missing'],
    },
    blog: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Blog',
        required: [true, 'Comment Missing'],
    },
    status: {
        type: String,
        enum: {
            values: ['read', 'unread'],
            message: '{VALUE} not supported',
        },
        default: 'unread',
    },
}, { timestamps: true });
// eslint-disable-next-line import/no-anonymous-default-export
exports.default = {
    FollowNotif: (0, mongoose_1.model)('FollowNotif', FollowNotifSchema),
    FollowingNotif: (0, mongoose_1.model)('FollowingNotif', FollowingNotifSchema),
    BlogNotif: (0, mongoose_1.model)('BlogNotif', BlogNotifSchema),
    CommentNotif: (0, mongoose_1.model)('CommentNotif', CommentNotifSchema),
};
