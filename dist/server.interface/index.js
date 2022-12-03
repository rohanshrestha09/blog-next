"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_STATUS = exports.NOTIFICATION = exports.genre = void 0;
exports.genre = [
    'Technology',
    'Science',
    'Programming',
    'Fashion',
    'Food',
    'Travel',
    'Music',
    'Lifestyle',
    'Fitness',
    'DIY',
    'Sports',
    'Finance',
    'Gaming',
    'News',
    'Movie',
    'Personal',
    'Business',
    'Political',
];
var NOTIFICATION;
(function (NOTIFICATION) {
    NOTIFICATION["FOLLOW_USER"] = "followUser";
    NOTIFICATION["LIKE_BLOG"] = "likeBlog";
    NOTIFICATION["LIKE_COMMENT"] = "likeComment";
    NOTIFICATION["POST_COMMENT"] = "postComment";
    NOTIFICATION["POST_BLOG"] = "postBlog";
})(NOTIFICATION = exports.NOTIFICATION || (exports.NOTIFICATION = {}));
var NOTIFICATION_STATUS;
(function (NOTIFICATION_STATUS) {
    NOTIFICATION_STATUS["READ"] = "read";
    NOTIFICATION_STATUS["UNREAD"] = "unread";
})(NOTIFICATION_STATUS = exports.NOTIFICATION_STATUS || (exports.NOTIFICATION_STATUS = {}));
