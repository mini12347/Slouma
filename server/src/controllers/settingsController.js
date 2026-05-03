import Settings from '../models/Settings.js';
import Admin from '../models/Admin.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Caregiver from '../models/caregiver.js';
import mongoose from 'mongoose';

const getUserModel = (role) => {
  const models = {
    admin: Admin,
    doctor: Doctor,
    patient: Patient,
    caregiver: Caregiver
  };
  return models[role?.toLowerCase()];
};

const createDefaultSettings = (userId, userType) => {
  const defaultSettings = {
    userId,
    userType,
    theme: 'light',
    language: 'en',
    notifications: {
      email: { enabled: true, appointments: true, prescriptions: true, testResults: true, systemUpdates: false },
      push: { enabled: true, appointments: true, prescriptions: true, testResults: true, systemUpdates: false },
      sms: { enabled: false, appointments: true, prescriptions: false, testResults: true, systemUpdates: false }
    },
    privacy: {
      profileVisibility: userType === 'Patient' ? 'doctors_only' : 'public',
      shareMedicalData: userType === 'Patient' ? true : false,
      allowEmergencyAccess: userType === 'Patient' ? true : false,
      twoFactorAuth: false
    },
    display: {
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      itemsPerPage: 20
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      reduceMotion: false,
      screenReader: false
    },
    roleSpecific: {},
    security: {
      sessionTimeout: 3600,
      requirePasswordChange: false,
      passwordChangeInterval: 90,
      loginNotifications: true,
      trustedDevices: []
    },
    app: {
      autoSave: true,
      showTooltips: true,
      compactMode: false,
      sidebarCollapsed: false
    }
  };

  switch (userType) {
    case 'Doctor':
      defaultSettings.roleSpecific.doctor = {
        defaultAppointmentDuration: 30,
        autoConfirmAppointments: false,
        showPatientPhotos: true,
        prescriptionTemplate: ''
      };
      break;
    case 'Patient':
      defaultSettings.roleSpecific.patient = {
        reminderTime: '09:00',
        autoRefillReminders: true,
        appointmentReminders: true,
        emergencyContactVisible: true
      };
      break;
    case 'Admin':
      defaultSettings.roleSpecific.admin = {
        dashboardLayout: 'grid',
        autoRefreshInterval: 300,
        showSystemLogs: false,
        emailAlertsLevel: 'critical'
      };
      break;
    case 'Caregiver':
      defaultSettings.roleSpecific.caregiver = {
        patientAlerts: true,
        medicationReminders: true,
        appointmentAlerts: true,
        emergencyAlerts: true
      };
      break;
  }

  return defaultSettings;
};

export const getUserSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const User = getUserModel(req.user?.role);
    if (!User) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    const user = await User.findOne({ $or: [{ _id: mongoose.Types.ObjectId.isValid(userId) ? userId : null }, { id: userId }] });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let settings = await Settings.findOne({ userId: user._id });
    
    if (!settings) {
      const defaultSettings = createDefaultSettings(user._id, user.constructor.modelName);
      settings = new Settings(defaultSettings);
      await settings.save();
      
      await User.findByIdAndUpdate(user._id, { settings: settings._id });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateUserSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const User = getUserModel(req.user?.role);
    if (!User) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    const user = await User.findOne({ $or: [{ _id: mongoose.Types.ObjectId.isValid(userId) ? userId : null }, { id: userId }] });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let settings = await Settings.findOne({ userId: user._id });
    
    if (!settings) {
      const defaultSettings = createDefaultSettings(user._id, user.constructor.modelName);
      settings = new Settings({ ...defaultSettings, ...updates });
    } else {
      Object.keys(updates).forEach(key => {
        if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && updates[key] !== null) {
          settings[key] = { ...settings[key], ...updates[key] };
        } else {
          settings[key] = updates[key];
        }
      });
    }

    await settings.save();

    if (!user.settings) {
      await User.findByIdAndUpdate(user._id, { settings: settings._id });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const resetUserSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    const User = getUserModel(req.user?.role);
    if (!User) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    const user = await User.findOne({ $or: [{ _id: mongoose.Types.ObjectId.isValid(userId) ? userId : null }, { id: userId }] });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Settings.findOneAndDelete({ userId: user._id });
    
    const defaultSettings = createDefaultSettings(user._id, user.constructor.modelName);
    const newSettings = new Settings(defaultSettings);
    await newSettings.save();

    await User.findByIdAndUpdate(user._id, { settings: newSettings._id });

    res.json(newSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateSettingsCategory = async (req, res) => {
  try {
    const { userId, category } = req.params;
    const categoryData = req.body;

    const validCategories = ['theme', 'language', 'notifications', 'privacy', 'display', 'accessibility', 'roleSpecific', 'security', 'app'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid settings category' });
    }

    const User = getUserModel(req.user?.role);
    if (!User) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    const user = await User.findOne({ $or: [{ _id: mongoose.Types.ObjectId.isValid(userId) ? userId : null }, { id: userId }] });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const settings = await Settings.findOne({ userId: user._id });
    
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found. Please create settings first.' });
    }

    settings[category] = { ...settings[category], ...categoryData };
    await settings.save();

    res.json({ [category]: settings[category] });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const initializeAllUserSettings = async (req, res) => {
  try {
    const results = [];
    
    const userTypes = [
      { model: Admin, name: 'Admin' },
      { model: Doctor, name: 'Doctor' },
      { model: Patient, name: 'Patient' },
      { model: Caregiver, name: 'Caregiver' }
    ];

    for (const userType of userTypes) {
      const users = await userType.model.find({ settings: { $exists: false } });
      
      for (const user of users) {
        try {
          const defaultSettings = createDefaultSettings(user._id, userType.name);
          const settings = new Settings(defaultSettings);
          await settings.save();
          
          await userType.model.findByIdAndUpdate(user._id, { settings: settings._id });
          results.push({ userId: user._id, userType: userType.name, status: 'success' });
        } catch (error) {
          results.push({ userId: user._id, userType: userType.name, status: 'error', error: error.message });
        }
      }
    }

    res.json({ 
      message: 'Settings initialization completed',
      results,
      totalProcessed: results.length,
      successCount: results.filter(r => r.status === 'success').length,
      errorCount: results.filter(r => r.status === 'error').length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
