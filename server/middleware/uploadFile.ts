import { getStorage } from 'firebase-admin/storage';
const UUID = require('uuid-v4');

const uploadFile = async (targetFile: Buffer, contentType: string, filename: string) => {
  const storageRef = getStorage().bucket();

  const uuid = UUID();

  const file = storageRef.file(filename);

  await file
    .save(targetFile, { metadata: { contentType, firebaseStorageDownloadTokens: uuid } })
    .then(async () => await file.makePublic());

  return `https://firebasestorage.googleapis.com/v0/b/blog-sansar.appspot.com/o/${encodeURIComponent(
    file.name
  )}?alt=media&token=${uuid}`;
};

export default uploadFile;
