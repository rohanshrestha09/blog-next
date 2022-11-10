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
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("firebase-admin/storage");
const UUID = require('uuid-v4');
const uploadFile = (targetFile, contentType, filename) => __awaiter(void 0, void 0, void 0, function* () {
    const storageRef = (0, storage_1.getStorage)().bucket();
    const uuid = UUID();
    const file = storageRef.file(filename);
    yield file
        .save(targetFile, { metadata: { contentType, firebaseStorageDownloadTokens: uuid } })
        .then(() => __awaiter(void 0, void 0, void 0, function* () { return yield file.makePublic(); }));
    return `https://firebasestorage.googleapis.com/v0/b/blog-sansar.appspot.com/o/${encodeURIComponent(file.name)}?alt=media&token=${uuid}`;
});
exports.default = uploadFile;
