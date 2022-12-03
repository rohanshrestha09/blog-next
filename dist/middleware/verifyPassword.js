"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../model/User"));
const asyncHandler = require('express-async-handler');
exports.default = asyncHandler(async (req, res, next) => {
    const { _id: authId } = res.locals.auth;
    const { password } = req.body;
    try {
        if (!password)
            return res.status(403).json({ message: 'Please input password' });
        const auth = await User_1.default.findById(authId).select('+password');
        if (!auth)
            return res.status(404).json({ message: 'User does not exist' });
        const isMatched = await bcryptjs_1.default.compare(password, auth.password);
        if (!isMatched)
            return res.status(403).json({ message: 'Incorrect Password' });
        next();
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
