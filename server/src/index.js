import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
for (const v of requiredEnvVars) {
  if (!process.env[v]) {
    console.error(`FATAL: Missing required environment variable ${v}. Aborting.`);
    process.exit(1);
  }
}

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/DoctorRoutes.js';
import caregiverRoutes from './routes/CaregiverRoutes.js';
import adminRoutes from './routes/AdminRoutes.js';
import messageRoutes from './routes/MessageRoutes.js';
import notificationRoutes from './routes/NotificationRoutes.js';
import publicRoutes from './routes/PublicRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import activityRoutes from './routes/ActivityRoutes.js';
import reportRoutes from './routes/ReportRoutes.js';
import linkingRoutes from './routes/LinkingRoutes.js';
import videoRoutes from './routes/VideoRoutes.js';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.CLIENT_URL || 'https://slouma-vvp1.vercel.app';

const corsOptions = {
  origin: function (origin, callback) {
    const allowed = [
      FRONTEND_URL,
      'https://slouma-production.up.railway.app',
      'https://slouma-shmb.vercel.app',
      'https://slouma-vvp1.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000',
    ];
    const vercelPreview = /^https:\/\/slouma-.*\.vercel\.app$/;
    if (!origin || allowed.includes(origin) || vercelPreview.test(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-id'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/links', linkingRoutes);
app.use('/api/videos', videoRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(express.static(path.join(__dirname, '../../client/dist')));

app.use((req, res) => {
  const distIndex = path.join(__dirname, '../../client/dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    res.sendFile(distIndex);
  } else {
    res.status(200).send(`
      <!DOCTYPE html><html><head><meta charset="utf-8"/>
      <title>Slouma Health</title>
      </head><body></body></html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
