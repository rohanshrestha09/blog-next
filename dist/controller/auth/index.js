"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.deleteProfile = exports.deleteImage = exports.updateProfile = exports.authHandler = void 0;
const moment_1 = __importDefault(require("moment"));
const cookie_1 = require("cookie");
const uploadFile_1 = __importDefault(require("../../middleware/uploadFile"));
const deleteFile_1 = __importDefault(require("../../middleware/deleteFile"));
const User_1 = __importDefault(require("../../model/User"));
const asyncHandler = require('express-async-handler');
moment_1.default.suppressDeprecationWarnings = true;
exports.authHandler = asyncHandler(async (req, res) => {
    return res.status(200).json({ data: res.locals.auth, message: 'Authentication Success' });
});
exports.updateProfile = asyncHandler(async (req, res) => {
    const { _id: authId, image, imageName } = res.locals.auth;
    const { fullname, bio, website, dateOfBirth } = req.body;
    try {
        if (req.files) {
            const file = req.files.image;
            if (!file.mimetype.startsWith('image/'))
                return res.status(403).json({ message: 'Please choose an image' });
            if (image && imageName)
                (0, deleteFile_1.default)(`users/${imageName}`);
            const filename = file.mimetype.replace('image/', `${authId}.`);
            const fileUrl = await (0, uploadFile_1.default)(file.data, file.mimetype, `users/${filename}`);
            await User_1.default.findByIdAndUpdate(authId, {
                image: fileUrl,
                imageName: filename,
            });
        }
        await User_1.default.findByIdAndUpdate(authId, {
            fullname,
            bio,
            website,
            dateOfBirth: new Date((0, moment_1.default)(dateOfBirth).format()),
        });
        return res.status(200).json({ message: 'Profile Updated Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.deleteImage = asyncHandler(async (req, res) => {
    const { _id: authId, image, imageName } = res.locals.auth;
    try {
        if (image && imageName)
            (0, deleteFile_1.default)(imageName);
        await User_1.default.findByIdAndUpdate(authId, {
            image: null,
            imageName: null,
        });
        return res.status(200).json({ message: 'Profile Image Removed Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.deleteProfile = asyncHandler(async (req, res) => {
    const { _id: authId, image, imageName } = res.locals.auth;
    try {
        if (image && imageName)
            (0, deleteFile_1.default)(`users/${imageName}`);
        await User_1.default.findByIdAndDelete(authId);
        return res.status(200).json({ message: 'Profile Deleted Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.logout = asyncHandler(async (req, res) => {
    try {
        const serialized = (0, cookie_1.serialize)('token', '', {
            maxAge: 0,
            path: '/',
        });
        res.setHeader('Set-Cookie', serialized);
        return res.status(200).json({ message: 'Logout Successful' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
