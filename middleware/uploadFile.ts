import firebaseAdmin from '../middleware/firebase';
import fsPromises from 'fs/promises';

async function uploadFile(targetFile: any, filename: string) {
  const storageRef = firebaseAdmin.storage().bucket();

  const file = storageRef.file(filename);

  const stream = file.createWriteStream({
    metadata: {
      contentType: targetFile.mimetype,
    },
  });

  stream.on('finish', async () => await file.makePublic());

  stream.end(await fsPromises.readFile(targetFile.filepath));

  return file.publicUrl();
}

export default uploadFile;
