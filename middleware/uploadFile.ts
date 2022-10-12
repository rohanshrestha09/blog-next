import firebaseAdmin from '../middleware/firebase';
import fsPromises from 'fs/promises';
const UUID = require('uuid-v4');

async function uploadFile(targetFile: any, filename: string) {
  const storageRef = firebaseAdmin.storage().bucket();

  let uuid = UUID();

  const file = storageRef.file(filename);

  const stream = file.createWriteStream({
    metadata: {
      contentType: targetFile.mimetype,
      firebaseStorageDownloadTokens: uuid,
    },
  });

  stream.on('finish', async () => await file.makePublic());

  stream.end(await fsPromises.readFile(targetFile.filepath));

  return `https://firebasestorage.googleapis.com/v0/b/blog-sansar.appspot.com/o/'${encodeURIComponent(
    file.name
  )}?alt=media&token=${uuid}`;
}

export default uploadFile;
