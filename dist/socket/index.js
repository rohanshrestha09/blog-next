"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchNotification = void 0;
const socket_io_client_1 = require("socket.io-client");
const lodash_1 = require("lodash");
const Notification_1 = __importDefault(require("../model/Notification"));
const dispatchNotification = ({ listeners, notificationId, }) => {
    var _a;
    const socket = (0, socket_io_client_1.io)((_a = process.env.NEXT_PUBLIC_BASE_URL) !== null && _a !== void 0 ? _a : 'http://localhost:5000');
    socket.emit('dispatch notification', { listeners, notificationId });
};
exports.dispatchNotification = dispatchNotification;
const dispatchSocket = async (io) => {
    global.users = new Map();
    io.on('connection', (socket) => {
        global.chatSocket = socket;
        socket.on('add user', (user) => {
            global.users.set(user, socket.id);
        });
        socket.on('dispatch notification', async ({ listeners, notificationId }) => {
            const users = [];
            listeners.forEach((listener) => {
                const user = global.users.get(listener);
                if (user)
                    users.push(user);
            });
            if (!(0, lodash_1.isEmpty)(users))
                io.to(users).emit('incoming notification', await Notification_1.default.findById(notificationId)
                    .populate('user', 'fullname image')
                    .populate('blog', 'title image')
                    .populate('comment', 'comment'));
        });
    });
};
exports.default = dispatchSocket;
