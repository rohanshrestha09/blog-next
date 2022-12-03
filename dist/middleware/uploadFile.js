"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("firebase-admin/storage");
const UUID = require('uuid-v4');
const uploadFile = async (targetFile, contentType, filename) => {
    const storageRef = (0, storage_1.getStorage)().bucket();
    const uuid = UUID();
    const file = storageRef.file(filename);
    await file
        .save(targetFile, { metadata: { contentType, firebaseStorageDownloadTokens: uuid } })
        .then(async () => await file.makePublic());
    return `https://firebasestorage.googleapis.com/v0/b/blog-sansar.appspot.com/o/${encodeURIComponent(file.name)}?alt=media&token=${uuid}`;
};
exports.default = uploadFile;
