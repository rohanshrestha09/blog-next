"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.following = exports.followers = void 0;
const User_1 = __importDefault(require("../../model/User"));
const asyncHandler = require('express-async-handler');
exports.followers = asyncHandler(async (req, res) => {
    const { followers } = res.locals.user;
    const { search, pageSize } = req.query;
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
    try {
        const users = await User_1.default.aggregate([...query, { $limit: Number(pageSize || 20) }]);
        const [{ totalCount } = { totalCount: 0 }] = await User_1.default.aggregate([
            ...query,
            { $count: 'totalCount' },
        ]);
        return res.status(200).json({
            data: users,
            count: totalCount,
            message: 'Followers fetched successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
exports.following = asyncHandler(async (req, res) => {
    const { following } = res.locals.user;
    const { search, pageSize } = req.query;
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
    try {
        const users = await User_1.default.aggregate([...query, { $limit: Number(pageSize || 20) }]);
        const [{ totalCount } = { totalCount: 0 }] = await User_1.default.aggregate([
            ...query,
            { $count: 'totalCount' },
        ]);
        return res.status(200).json({
            data: users,
            count: totalCount,
            message: 'Following fetched successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
