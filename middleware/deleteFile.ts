import { getStorage } from 'firebase-admin/storage';

const deleteFile = async (filename: string) => {
  const storageRef = getStorage().bucket();

  storageRef.file(filename).delete();
};

export default deleteFile;
