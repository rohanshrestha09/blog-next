"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const User_1 = __importDefault(require("../model/User"));
const asyncHandler = require('express-async-handler');
exports.default = asyncHandler(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token)
        return res.status(401).json({ message: 'Not authorised' });
    try {
        const { _id } = (0, jsonwebtoken_1.verify)(token, process.env.JWT_TOKEN);
        const auth = await User_1.default.findById(_id).select('-password');
        if (!auth)
            return res.status(404).json({ message: 'User does not exist' });
        res.locals.auth = auth;
        next();
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
