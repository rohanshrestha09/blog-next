"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("firebase-admin/storage");
const deleteFile = async (filename) => {
    const storageRef = (0, storage_1.getStorage)().bucket();
    storageRef.file(filename).delete();
};
exports.default = deleteFile;
