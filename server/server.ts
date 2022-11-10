import next from 'next';
import express, { Request, Response, Application } from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import fileUpload from 'express-fileupload';
import connectDB from './db';
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: __dirname + '/.env' });

const dev = process.env.NODE_ENV !== 'production';

const hostname = 'localhost';

const PORT = 3000;

const server = next({ dev, hostname, port: PORT });

const handle = server.getRequestHandler();

server.prepare().then(() => {
  const app: Application = express();

  app.use(express.urlencoded({ extended: false }));

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use(cookieParser());

  app.use(bodyParser.json());

  app.use(fileUpload());

  connectDB();

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // 100
    standardHeaders: true,
    legacyHeaders: false,
  });

  const serviceAccount = require('./blog-sansar-firebase-adminsdk-8snwe-96b9089a8c');

  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'gs://blog-sansar.appspot.com',
  });

  app.use(limiter);

  app.use('/api', require('./routes/auth'));

  app.use('/api', require('./routes/user'));

  app.use('/api', require('./routes/security'));

  app.use('/api', require('./routes/blog'));

  app.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });

  app.listen(PORT);
});
