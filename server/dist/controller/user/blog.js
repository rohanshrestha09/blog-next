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
exports.blog = void 0;
const Blog_1 = __importDefault(require("../../model/Blog"));
const asyncHandler = require('express-async-handler');
exports.blog = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { blogs } = res.locals.user;
    const { pageSize } = req.query;
    let query = { _id: blogs, isPublished: true };
    try {
        return res.status(200).json({
            data: yield Blog_1.default.find(query)
                .sort({ likes: -1 })
                .limit(Number(pageSize || 20))
                .populate('author', 'fullname image'),
            count: yield Blog_1.default.countDocuments(query),
            message: 'Blogs Fetched Successfully',
        });
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
}));
