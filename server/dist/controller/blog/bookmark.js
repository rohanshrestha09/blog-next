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
exports.unbookmark = exports.bookmark = void 0;
const User_1 = __importDefault(require("../../model/User"));
const asyncHandler = require('express-async-handler');
exports.bookmark = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auth: { _id: authId }, blog: { _id: blogId }, } = res.locals;
    try {
        const bookmarkExist = yield User_1.default.findOne({
            $and: [{ _id: authId }, { bookmarks: blogId }],
        });
        if (bookmarkExist)
            return res.status(403).json({ message: 'Already Bookmarked' });
        yield User_1.default.findByIdAndUpdate(authId, { $push: { bookmarks: blogId } });
        return res.status(200).json({ message: 'Bookmarked Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.unbookmark = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auth: { _id: authId }, blog: { _id: blogId }, } = res.locals;
    try {
        const bookmarkExist = yield User_1.default.findOne({
            $and: [{ _id: authId }, { bookmarks: blogId }],
        });
        if (!bookmarkExist)
            return res.status(403).json({ message: 'Already Unbookmarked' });
        yield User_1.default.findByIdAndUpdate(authId, { $pull: { bookmarks: blogId } });
        return res.status(200).json({ message: 'Unbookmarked Successfully' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
