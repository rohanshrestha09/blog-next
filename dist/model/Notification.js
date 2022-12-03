"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const server_interface_1 = require("../server.interface");
const { UNREAD } = server_interface_1.NOTIFICATION_STATUS;
const NotificationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: [true, 'Please provide notification type'],
        enum: {
            values: Object.values(server_interface_1.NOTIFICATION),
            message: '{VALUE} not supported',
        },
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User Missing'],
    },
    listener: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Listener Missing'],
    },
    blog: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Blog',
    },
    comment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Comment',
    },
    description: {
        type: String,
        required: [true, 'Description missing'],
    },
    status: {
        type: String,
        enum: {
            values: Object.values(server_interface_1.NOTIFICATION_STATUS),
            message: '{VALUE} not supported',
        },
        default: UNREAD,
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Notification', NotificationSchema);
