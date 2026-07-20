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
  // 1. Password hashing
  if (this.isModified('password')) {
    this.passwordHint = this.password;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // 2. Ensure patient has at least one doctor
  if (!this.doctorIDs || this.doctorIDs.length === 0) {
    const Doctor = mongoose.model('Doctor');
    const firstDoc = await Doctor.findOne({});
    if (firstDoc) {
      const docId = firstDoc.id || firstDoc._id.toString();
      this.doctorIDs = [docId];
      await Doctor.updateOne(
        { _id: firstDoc._id },
        { $addToSet: { patientIDs: this.id || this._id.toString() } }
      );
    }
  }

  // 3. Ensure patient has at least one caregiver
  if (!this.caregiverIDs || this.caregiverIDs.length === 0) {
    const Caregiver = mongoose.model('Caregiver');
    const firstCg = await Caregiver.findOne({});
    if (firstCg) {
      const cgId = firstCg.id || firstCg._id.toString();
      this.caregiverIDs = [cgId];
      await Caregiver.updateOne(
        { _id: firstCg._id },
        { $addToSet: { patientIDs: this.id || this._id.toString() } }
      );
      
      if (this.doctorIDs && this.doctorIDs.length > 0) {
        const Doctor = mongoose.model('Doctor');
        for (const docId of this.doctorIDs) {
          const doc = await Doctor.findOne({ $or: [{ id: docId }, { _id: mongoose.Types.ObjectId.isValid(docId) ? docId : null }] });
          if (doc) {
            await Caregiver.updateOne({ _id: firstCg._id }, { $addToSet: { doctorIDs: doc.id || doc._id.toString() } });
            await Doctor.updateOne({ _id: doc._id }, { $addToSet: { caregiverIDs: cgId } });
          }
        }
      }
    }
  }
});

patientSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
