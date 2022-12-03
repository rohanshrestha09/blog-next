"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    blog: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Blog',
        required: [true, 'Blog missing'],
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User missing'],
    },
    comment: {
        type: String,
        required: [true, 'Comment missing'],
    },
    likers: { type: [mongoose_1.Schema.Types.ObjectId], default: [] },
    likesCount: { type: Number, default: 0 },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Comment', CommentSchema);
