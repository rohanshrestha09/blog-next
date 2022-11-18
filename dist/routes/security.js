"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const verifyUser_1 = __importDefault(require("../middleware/verifyUser"));
const verifyPassword_1 = __importDefault(require("../middleware/verifyPassword"));
const security_1 = require("../controller/security");
const router = (0, express_1.Router)();
router.get('/security/reset-password', security_1.resetLink);
router.post('/security/reset-password/:user/:token', verifyUser_1.default, security_1.resetPassword);
router.post('/security/change-password', auth_1.default, verifyPassword_1.default, security_1.changePassword);
module.exports = router;
