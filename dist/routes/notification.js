"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_1 = require("../controller/notification");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.get('/notification', auth_1.default, notification_1.notifications);
router.put('/notification/:notification', notification_1.markAsRead);
router.put('/notification', notification_1.markAllAsRead);
module.exports = router;
