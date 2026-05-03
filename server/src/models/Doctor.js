import mongoose from "mongoose"
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '../utils/encryption.js';

const AppointmentSchema = new mongoose.Schema({
    patientName: String,
    patientId: String,
    time: String,
    date: Date,
    type: String,
    duration: String,
    status: { type: String, default: 'Scheduled' }
});

const PrescriptionSchema = new mongoose.Schema({
    patientID: String,
    medications: [
        {
            name: String,
            dosage: String,
            frequency: String,
            startDate: Date,
            endDate: Date,
        }
    ],
    date: Date,
});

const DoctorSchema = new mongoose.Schema({
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
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
    },
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
    image: {
        type: Buffer,
        required: false,
    },
    prescriptions: [PrescriptionSchema],
    patientIDs: [String],
    caregiverIDs: [String],
    appointments: [AppointmentSchema],
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

DoctorSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

DoctorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Doctor = mongoose.model('Doctor', DoctorSchema);
export default Doctor;