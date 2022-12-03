"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    fullname: {
        type: String,
        required: [true, 'Please input your fullname.'],
    },
    email: {
        type: String,
        required: [true, 'Please input your email.'],
        lowercase: true,
        trim: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Please input password.'],
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please provide Date of Birth.'],
    },
    image: { type: String, default: null },
    imageName: { type: String, default: null },
    bookmarks: { type: [mongoose_1.Schema.Types.ObjectId], default: [] },
    blogs: { type: [mongoose_1.Schema.Types.ObjectId], default: [] },
    bio: { type: String, default: null },
    website: { type: String, default: null, lowercase: true },
    following: { type: [mongoose_1.Schema.Types.ObjectId], default: [] },
    followers: { type: [mongoose_1.Schema.Types.ObjectId], default: [] },
    followingCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('User', UserSchema);
