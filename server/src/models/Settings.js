import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  userType: {
    type: String,
    required: true,
    enum: ['Admin', 'Doctor', 'Patient', 'Caregiver']
  },
  
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  
  language: {
    type: String,
    enum: ['en', 'fr', 'ar', 'tn'],
    default: 'en'
  },
  
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      appointments: { type: Boolean, default: true },
      prescriptions: { type: Boolean, default: true },
      testResults: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: false }
    },
    push: {
      enabled: { type: Boolean, default: true },
      appointments: { type: Boolean, default: true },
      prescriptions: { type: Boolean, default: true },
      testResults: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: false }
    },
    sms: {
      enabled: { type: Boolean, default: false },
      appointments: { type: Boolean, default: true },
      prescriptions: { type: Boolean, default: false },
      testResults: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: false }
    }
  },
  
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'doctors_only', 'private'],
      default: 'doctors_only'
    },
    shareMedicalData: { type: Boolean, default: true },
    allowEmergencyAccess: { type: Boolean, default: true },
    twoFactorAuth: { type: Boolean, default: false }
  },
  
  display: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    itemsPerPage: {
      type: Number,
      min: 10,
      max: 100,
      default: 20
    }
  },
  
  accessibility: {
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra-large'],
      default: 'medium'
    },
    highContrast: { type: Boolean, default: false },
    reduceMotion: { type: Boolean, default: false },
    screenReader: { type: Boolean, default: false }
  },
  
  roleSpecific: {
    doctor: {
      defaultAppointmentDuration: { type: Number, default: 30 },
      autoConfirmAppointments: { type: Boolean, default: false },
      showPatientPhotos: { type: Boolean, default: true },
      prescriptionTemplate: { type: String, default: '' }
    },
    patient: {
      reminderTime: { type: String, default: '09:00' },
      autoRefillReminders: { type: Boolean, default: true },
      appointmentReminders: { type: Boolean, default: true },
      emergencyContactVisible: { type: Boolean, default: true }
    },
    admin: {
      dashboardLayout: { 
        type: String, 
        enum: ['grid', 'list', 'cards'], 
        default: 'grid' 
      },
      autoRefreshInterval: { type: Number, default: 300 },
      showSystemLogs: { type: Boolean, default: false },
      emailAlertsLevel: {
        type: String,
        enum: ['critical', 'warning', 'info', 'all'],
        default: 'critical'
      }
    },
    caregiver: {
      patientAlerts: { type: Boolean, default: true },
      medicationReminders: { type: Boolean, default: true },
      appointmentAlerts: { type: Boolean, default: true },
      emergencyAlerts: { type: Boolean, default: true }
    }
  },
  
  security: {
    sessionTimeout: { type: Number, default: 3600 },
    requirePasswordChange: { type: Boolean, default: false },
    passwordChangeInterval: { type: Number, default: 90 },
    loginNotifications: { type: Boolean, default: true },
    trustedDevices: [{
      deviceName: String,
      deviceType: String,
      lastUsed: Date,
      trusted: Boolean
    }]
  },
  
  app: {
    autoSave: { type: Boolean, default: true },
    showTooltips: { type: Boolean, default: true },
    compactMode: { type: Boolean, default: false },
    sidebarCollapsed: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

settingsSchema.index({ userId: 1, userType: 1 }, { unique: true });

settingsSchema.pre('save', function(next) {
  const userRoles = ['admin', 'doctor', 'patient', 'caregiver'];
  const currentUserRole = this.userType.toLowerCase();
  
  userRoles.forEach(role => {
    if (role !== currentUserRole) {
      this.roleSpecific[role] = undefined;
    }
  });
  
  next();
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
