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
exports.unlikeComment = exports.likeComment = void 0;
const Comment_1 = __importDefault(require("../../../model/Comment"));
const asyncHandler = require('express-async-handler');
exports.likeComment = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: authId } = res.locals.auth;
    const { commentId } = req.query;
    try {
        const likeExist = yield Comment_1.default.findOne({
            $and: [{ _id: commentId }, { likers: authId }],
        });
        if (likeExist)
            return res.status(403).json({ message: 'Already Liked' });
        const comment = yield Comment_1.default.findById(commentId);
        if (!comment)
            return res.status(404).json({ message: 'Comment does not exist' });
        comment.likesCount += 1;
        comment.likers.push(authId);
        yield comment.save();
        return res.status(200).json({ message: 'Liked' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.unlikeComment = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: authId } = res.locals.auth;
    const { commentId } = req.query;
    try {
        const likeExist = yield Comment_1.default.findOne({
            $and: [{ _id: commentId }, { likers: authId }],
        });
        if (!likeExist)
            return res.status(403).json({ message: 'ALready Unliked' });
        const comment = yield Comment_1.default.findById(commentId);
        if (!comment)
            return res.status(404).json({ message: 'Comment does not exist' });
        comment.likesCount -= 1;
        comment.likers = comment.likers.filter((likers) => likers.toString() !== authId.toString());
        yield comment.save();
        return res.status(200).json({ message: 'Unliked' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
