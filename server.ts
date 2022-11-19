import next from 'next';
import express, { Request, Response, Application } from 'express';
import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import dispatchSocket from './socket';

const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const dev = process.env.NODE_ENV !== 'production';

const PORT = process.env.PORT || 5000;

const server = next({ dir: '.', dev });

const handler = server.getRequestHandler();

server.prepare().then(() => {
  const app: Application = express();

  const server = http.createServer(app);

  const io = new Server(server);

  app.use(express.urlencoded({ extended: false }));

  app.use(cookieParser());

  app.use(bodyParser.json());

  app.use(fileUpload());

  mongoose.connect(process.env.MONGODB_URI as string);

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // 100
    standardHeaders: true,
    legacyHeaders: false,
  });

  initializeApp({
    credential: cert({
      type: 'service_account',
      project_id: 'blog-sansar',
      private_key_id: process.env.PRIVATE_KEY_ID,
      private_key: process.env.PRIVATE_KEY,
      client_email: process.env.CLIENT_EMAIL,
      client_id: process.env.CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    } as ServiceAccount),
    storageBucket: 'gs://blog-sansar.appspot.com',
  });

  app.use(limiter);

  app.use('/api', require('./routes/auth'));

  app.use('/api', require('./routes/user'));

  app.use('/api', require('./routes/blog'));

  app.use('/api', require('./routes/security'));

  app.use('/api', require('./routes/notification'));

  app.all('*', (req: Request, res: Response) => handler(req, res));

  dispatchSocket(io);

  server.listen(PORT);
});
