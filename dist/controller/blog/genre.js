"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genre = void 0;
const enum_1 = require("../../enum");
const asyncHandler = require('express-async-handler');
exports.genre = asyncHandler(async (req, res) => {
    res.setHeader('Cache-Control', 'public,max-age=86400');
    return res.status(200).json({ data: enum_1.genre, message: 'Genre Fetched Successfully' });
});
