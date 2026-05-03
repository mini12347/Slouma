import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '../utils/encryption.js';

const patientSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'Please add an ID'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    get: decrypt,
    set: encrypt
  },
  lastname: {
    type: String,
    required: [true, 'Please add a lastname'],
    get: decrypt,
    set: encrypt
  },
  doctorIDs: [String],
  caregiverIDs: [String],
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
  },
  bloodGroup: {
    type: String,
    required: [true, 'Please add a blood group'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add a date of birth'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Please specify gender'],
  },
  image: {
    type: Buffer,
    required: false,
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    get: decrypt,
    set: encrypt
  },
  address: {
    type: String,
    get: decrypt,
    set: encrypt
  },
  currentConditions: [String],
  medications: [
    {
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date,
    }
  ],
  medicalHistory: [
    {
      conditions: [String],
      date: Date,
      notes: String,
    },
  ],
  vitalSigns: [
    {
      heartRate: Number,
      bloodPressure: String,
      respiratoryRate: Number,
      temperature: Number,
      weight: Number,
      date: Date,
    },
  ], 
  appointments: [
    {
      date: Date,
      time: String,
      doctorID: String,
      reason: String,
    }
  ],
  emergencyContacts: [
    {
      name: String,
      relationship: String,
      phone: String,
    }
  ],
  password: {
    type: String,
    required: [true, 'Please add a password'],
  },
  passwordHint: {
    type: String,
    get: decrypt,
    set: encrypt
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive'],
    default: 'pending',
  },
  healthStatus: {
    type: String,
    enum: ['stable', 'surveillance', 'critique'],
    default: 'stable',
  },
  prescriptions: [
    {
      doctorID: String,
      medications: [
        {
          name: String,
          dosage: String,
          frequency: String,
          startDate: Date,
          endDate: Date,
        }
      ],
      date: { type: Date, default: Date.now },
      status: { type: String, default: 'Active' }
    }
  ],
  lastActive: { type: Date, default: Date.now },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: String,
  settings: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Settings'
  }

}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

patientSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.passwordHint = this.password;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

patientSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
