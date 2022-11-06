import firebaseAdmin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../blog-sansar-firebase-adminsdk-8snwe-96b9089a8c';

try {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount as ServiceAccount),
    storageBucket: 'gs://blog-sansar.appspot.com',
  });
} catch (error: Error | any) {
  if (!/already exists/u.test(error.message)) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export default firebaseAdmin;
