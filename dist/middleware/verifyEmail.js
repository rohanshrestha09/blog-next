"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const asyncHandler = require('express-async-handler');
exports.default = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const options = {
        method: 'GET',
        url: `https://email-verifier-completely-free.p.rapidapi.com/email-verification/${email}`,
        headers: {
            'X-RapidAPI-Key': process.env.RAPID_API_KEY,
            'X-RapidAPI-Host': 'email-verifier-completely-free.p.rapidapi.com',
        },
    };
    try {
        const { data } = await axios_1.default.request(options);
        if (data.response.email_status !== 'Yes')
            return res.status(404).json({ message: 'Invalid Email' });
        next();
    }
    catch (err) {
        return res.status(404).json({ message: err.message });
    }
});
