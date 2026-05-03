import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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



dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Slouma API running' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
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




app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
