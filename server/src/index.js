import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Define corsOptions as a variable so it can be reused below
const corsOptions = {
  origin: function (origin, callback) {
    const allowed = [
      'https://slouma-shmb.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000',
    ];
    const vercelPreview = /^https:\/\/slouma-shmb.*\.vercel\.app$/;
    if (!origin || allowed.includes(origin) || vercelPreview.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-id'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // ✅ handles preflight, no path-to-regexp crash

app.use(express.json());

// ─── ROUTES ──────────────────────────────────────────────────────────────────
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

// ─── STATIC FILES ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(express.static(path.join(__dirname, '../../client/dist')));

// ─── CATCH-ALL → FRONTEND ────────────────────────────────────────────────────
app.use((req, res) => {
  const distIndex = path.join(__dirname, '../../client/dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    res.sendFile(distIndex);
  } else {
    res.status(200).send(`
      <!DOCTYPE html><html><head><meta charset="utf-8"/>
      <title>Slouma Health</title>
      <script>window.location.replace('http://localhost:5173${req.originalUrl}');</script>
      <noscript><a href="http://localhost:5173${req.originalUrl}">Click here</a></noscript>
      </head><body></body></html>
    `);
  }
});

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});