import mongoose from "mongoose"
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '../utils/encryption.js';

const CaregiverSchema = mongoose.Schema({
    id: {
        type: String,
        required: [true, 'enter an ID']
    },
    name: {
        type: String,
        required: [true, 'enter a name'],
        get: decrypt,
        set: encrypt
    },
    lastname: {
        type: String,
        required: [true, 'enter a lastname'],
        get: decrypt,
        set: encrypt
    },
    email: {
        type: String,
        required: [true, 'enter an email']
    },
    password: {
        type: String,
        required: [true, 'enter a password']
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
        required: [true, 'enter a phone number'],
        get: decrypt,
        set: encrypt
    },
    image: {
        type: Buffer,
        required: false,
    },
    patientIDs: [String],
    doctorIDs: [String],
    tasks: [
        {
            title: String,
            description: String,
            date: Date,
            status: String,
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

CaregiverSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    this.passwordHint = this.password;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

CaregiverSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Caregiver = mongoose.model('Caregiver', CaregiverSchema);
export default Caregiver;