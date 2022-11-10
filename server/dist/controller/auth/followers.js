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
exports.following = exports.followers = void 0;
const User_1 = __importDefault(require("../../model/User"));
const asyncHandler = require('express-async-handler');
exports.followers = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { followers } = res.locals.auth;
    const { pageSize, search } = req.query;
    const query = [
        { $match: { _id: { $in: followers } } },
        { $project: { password: 0, email: 0 } },
    ];
    if (search)
        query.unshift({
            $search: {
                index: 'blog-user-search',
                autocomplete: { query: String(search), path: 'fullname' },
            },
        });
    const users = yield User_1.default.aggregate([...query, { $limit: Number(pageSize || 20) }]);
    const [{ totalCount } = { totalCount: 0 }] = yield User_1.default.aggregate([
        ...query,
        { $count: 'totalCount' },
    ]);
    try {
        return res.status(200).json({
            data: users,
            count: totalCount,
            message: 'Followers fetched successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
exports.following = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { following } = res.locals.auth;
    const { pageSize, search } = req.query;
    const query = [
        { $match: { _id: { $in: following } } },
        { $project: { password: 0, email: 0 } },
    ];
    if (search)
        query.unshift({
            $search: {
                index: 'blog-user-search',
                autocomplete: { query: String(search), path: 'fullname' },
            },
        });
    const users = yield User_1.default.aggregate([...query, { $limit: Number(pageSize || 20) }]);
    const [{ totalCount } = { totalCount: 0 }] = yield User_1.default.aggregate([
        ...query,
        { $count: 'totalCount' },
    ]);
    try {
        return res.status(200).json({
            data: users,
            count: totalCount,
            message: 'Following fetched successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
