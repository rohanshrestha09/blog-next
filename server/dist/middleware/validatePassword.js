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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../model/User"));
const asyncHandler = require('express-async-handler');
exports.default = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: authId } = res.locals.auth;
    const { password } = req.body;
    try {
        if (!password)
            return res.status(403).json({ message: 'Please input password' });
        const auth = yield User_1.default.findById(authId).select('+password');
        if (!auth)
            return res.status(404).json({ message: 'User does not exist' });
        const isMatched = yield bcryptjs_1.default.compare(password, auth.password);
        if (!isMatched)
            return res.status(403).json({ message: 'Incorrect Password' });
        next();
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
