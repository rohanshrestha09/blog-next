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
exports.unfollow = exports.follow = void 0;
const User_1 = __importDefault(require("../../model/User"));
const asyncHandler = require('express-async-handler');
exports.follow = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auth: { _id: authId, followingCount }, user: { _id: userId, followersCount }, } = res.locals;
    if (authId.toString() === userId.toString())
        return res.status(403).json({ message: "Can't follow same user" });
    try {
        const followingExists = yield User_1.default.findOne({
            $and: [{ _id: authId }, { following: userId }],
        });
        if (followingExists)
            return res.status(403).json({ message: 'Already Following' });
        yield User_1.default.findByIdAndUpdate(authId, {
            $push: { following: userId },
            followingCount: followingCount + 1,
        });
        yield User_1.default.findByIdAndUpdate(userId, {
            $push: { followers: authId },
            followersCount: followersCount + 1,
        });
        return res.status(200).json({ message: 'Follow Successful' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.unfollow = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auth: { _id: authId, followingCount }, user: { _id: userId, followersCount }, } = res.locals;
    if (authId.toString() === userId.toString())
        return res.status(403).json({ message: "Can't unfollow same user" });
    try {
        const followingExists = yield User_1.default.findOne({
            $and: [{ _id: authId }, { following: userId }],
        });
        if (!followingExists)
            return res.status(403).json({ message: 'Not following' });
        yield User_1.default.findByIdAndUpdate(authId, {
            $pull: { following: userId },
            followingCount: followingCount - 1,
        });
        yield User_1.default.findByIdAndUpdate(userId, {
            $pull: { followers: authId },
            followersCount: followersCount - 1,
        });
        return res.status(200).json({ message: 'Unfollow Successful' });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
