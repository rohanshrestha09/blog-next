"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const enum_1 = require("../enum");
const BlogSchema = new mongoose_1.Schema({
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author missing'],
    },
    image: { type: String, default: null },
    imageName: { type: String, default: null },
    title: {
        type: String,
        required: [true, 'Title missing'],
    },
    content: {
        type: String,
        required: [true, 'Content missing'],
    },
    genre: {
        type: [String],
        required: [true, 'Atleast one genre required'],
        validate: [
            function (val) {
                return val.length <= 4;
            },
            'Only 4 genre allowed',
        ],
        enum: {
            values: enum_1.genre,
            message: '{VALUE} not supported',
        },
    },
    likers: { type: [mongoose_1.Schema.Types.ObjectId], default: [] },
    likesCount: { type: Number, default: 0 },
    comments: { type: [mongoose_1.Schema.Types.ObjectId], default: [] },
    commentsCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Blog', BlogSchema);
