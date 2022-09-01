import { NextApiRequest, NextApiResponse } from 'next';
import { NextFunction } from 'express';
import { initializeApp } from 'firebase/app';
import mongoose from 'mongoose';

const middleware = async (req: NextApiRequest, res: NextApiResponse, next: NextFunction) => {
  await mongoose.connect(process.env.MONGODB_URI as string);

  const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: 'blog-sansar.firebaseapp.com',
    projectId: 'blog-sansar',
    storageBucket: 'blog-sansar.appspot.com',
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
  };

  // Initialize Firebase
  initializeApp(firebaseConfig);

  next();
};

export default middleware;
