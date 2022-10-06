import firebaseAdmin from '../middleware/firebase';

async function deleteFile(filename: string) {
  const storageRef = firebaseAdmin.storage().bucket();

  storageRef.file(filename).delete();
}

export default deleteFile;
