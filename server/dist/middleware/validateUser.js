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
const User_1 = __importDefault(require("../model/User"));
const asyncHandler = require('express-async-handler');
exports.default = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { user: userId } = req.params || req.query;
    try {
        const user = yield User_1.default.findById(userId).select('-password -email');
        if (!user)
            return res.status(404).json({ message: 'User does not exist' });
        res.locals.user = user;
        next();
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
