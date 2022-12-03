"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genre = void 0;
const server_interface_1 = require("../../server.interface");
const asyncHandler = require('express-async-handler');
exports.genre = asyncHandler(async (req, res) => {
    res.setHeader('Cache-Control', 'public,max-age=86400');
    return res.status(200).json({ data: server_interface_1.genre, message: 'Genre Fetched Successfully' });
});
