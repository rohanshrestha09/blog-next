"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestions = exports.user = exports.login = exports.register = void 0;
const moment_1 = __importDefault(require("moment"));
const cookie_1 = require("cookie");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = require("jsonwebtoken");
const uploadFile_1 = __importDefault(require("../../middleware/uploadFile"));
const User_1 = __importDefault(require("../../model/User"));
const asyncHandler = require('express-async-handler');
exports.register = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullname, email, password, confirmPassword, dateOfBirth } = req.body;
    try {
        const userExists = yield User_1.default.findOne({ email });
        if (userExists)
            return res.status(403).json({ message: 'User already exists. Choose a different email.' });
        if (!password || password < 8)
            return res.status(403).json({ message: 'Password must contain atleast 8 characters.' });
        if (password !== confirmPassword)
            return res.status(403).json({ message: 'Password does not match.' });
        const salt = yield bcryptjs_1.default.genSalt(10);
        const encryptedPassword = yield bcryptjs_1.default.hash(password, salt);
        const { _id: authId } = yield User_1.default.create({
            fullname,
            email,
            password: encryptedPassword,
            dateOfBirth: new Date((0, moment_1.default)(dateOfBirth).format()),
        });
        if (req.files) {
            const file = req.files.image;
            if (!file.mimetype.startsWith('image/'))
                return res.status(403).json({ message: 'Please choose an image' });
            const filename = file.mimetype.replace('image/', `${authId}.`);
            const fileUrl = yield (0, uploadFile_1.default)(file.data, file.mimetype, `users/${filename}`);
            yield User_1.default.findByIdAndUpdate(authId, {
                image: fileUrl,
                imageName: filename,
            });
        }
        const token = (0, jsonwebtoken_1.sign)({ _id: authId }, process.env.JWT_TOKEN, {
            expiresIn: '30d',
        });
        const serialized = (0, cookie_1.serialize)('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'none',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        });
        res.setHeader('Set-Cookie', serialized);
        return res.status(200).json({ token, message: 'Signup Successful' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.login = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.default.findOne({ email }).select('+password');
        if (!user)
            return res.status(404).json({ message: 'User does not exist.' });
        const isMatched = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatched)
            return res.status(403).json({ message: 'Incorrect Password' });
        const token = (0, jsonwebtoken_1.sign)({ _id: user._id }, process.env.JWT_TOKEN, {
            expiresIn: '30d',
        });
        const serialized = (0, cookie_1.serialize)('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'none',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        });
        res.setHeader('Set-Cookie', serialized);
        return res.status(200).json({ token, message: 'Login Successful' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.user = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.status(200).json({
            data: res.locals.user,
            message: 'User Fetched Successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.suggestions = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, search } = req.query;
    const query = [{ $project: { password: 0, email: 0 } }];
    if (search)
        query.unshift({
            $search: {
                index: 'blog-user-search',
                autocomplete: { query: String(search), path: 'fullname' },
            },
        });
    const users = yield User_1.default.aggregate([...query, { $sample: { size: Number(pageSize || 20) } }]);
    const [{ totalCount } = { totalCount: 0 }] = yield User_1.default.aggregate([
        ...query,
        { $count: 'totalCount' },
    ]);
    try {
        return res.status(200).json({
            data: users,
            count: totalCount,
            message: 'Users Fetched Successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
