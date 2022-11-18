"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const next_1 = __importDefault(require("next"));
const express_1 = __importDefault(require("express"));
const app_1 = require("firebase-admin/app");
const mongoose_1 = __importDefault(require("mongoose"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;
const server = (0, next_1.default)({ dir: '.', dev });
const handler = server.getRequestHandler();
server.prepare().then(() => {
    const app = (0, express_1.default)();
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use((0, express_fileupload_1.default)());
    mongoose_1.default.connect(process.env.MONGODB_URI);
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        standardHeaders: true,
        legacyHeaders: false,
    });
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)({
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
        }),
        storageBucket: 'gs://blog-sansar.appspot.com',
    });
    app.use(limiter);
    app.use('/api', require('./routes/auth'));
    app.use('/api', require('./routes/user'));
    app.use('/api', require('./routes/security'));
    app.use('/api', require('./routes/blog'));
    app.all('*', (req, res) => handler(req, res));
    app.listen(PORT);
});
