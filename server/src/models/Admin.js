import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '../utils/encryption.js';

const adminSchema = new mongoose.Schema({
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
    activityLog: [
        {
            msg: String,
            user: String,
            date: { type: Date, default: Date.now }
        }
    ],
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
    reports: [
        {
            title: String,
            content: String,
            date: Date,
        }
    ],
    lastActive: { type: Date, default: Date.now },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: String,
    cachedStats: {

        totalUsers: Number,
        patientsCount: Number,
        doctorsCount: Number,
        caregiversCount: Number,
        adminsCount: Number,
        criticalAlertsCount: Number,
        registrationTrends: [mongoose.Schema.Types.Mixed],
        lastUpdated: Date
    },
    settings: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Settings'
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});


adminSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    this.passwordHint = this.password;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


adminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;