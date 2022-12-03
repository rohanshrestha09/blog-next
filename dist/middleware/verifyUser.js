"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../model/User"));
const asyncHandler = require('express-async-handler');
exports.default = asyncHandler(async (req, res, next) => {
    const { user: userId } = req.params || req.query;
    try {
        const user = await User_1.default.findById(userId).select('-password -email');
        if (!user)
            return res.status(404).json({ message: 'User does not exist' });
        res.locals.user = user;
        next();
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
