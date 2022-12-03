"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyUser_1 = __importDefault(require("../middleware/verifyUser"));
const verifyEmail_1 = __importDefault(require("../middleware/verifyEmail"));
const user_1 = require("../controller/user");
const blog_1 = require("../controller/user/blog");
const followers_1 = require("../controller/user/followers");
const router = (0, express_1.Router)();
router.post('/user/register', verifyEmail_1.default, user_1.register);
router.post('/user/login', user_1.login);
router.get('/user/suggestions', user_1.suggestions);
router.param('user', verifyUser_1.default);
router.get('/user/:user', user_1.user);
router.get('/user/:user/blog', blog_1.blog);
router.get('/user/:user/followers', followers_1.followers);
router.get('/user/:user/following', followers_1.following);
module.exports = router;
