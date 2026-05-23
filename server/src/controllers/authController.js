import jwt from 'jsonwebtoken';
import { findUserByEmail, verifyPassword, createUser } from '../services/userService.js';
import Admin from '../models/Admin.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Caregiver from '../models/caregiver.js';
import PendingUser from '../models/PendingUser.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Notification from '../models/Notification.js';
import crypto from 'crypto';
import { sendVerificationEmail } from '../services/emailService.js';
import VerificationCode from '../models/VerificationCode.js';
import cache from '../config/cache.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

const validatePasswordComplexity = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return regex.test(password);
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (user && (await verifyPassword(user, password))) {
      if (!user.isEmailVerified) {
        return res.status(403).json({ message: 'Please verify your email address before logging in.' });
      }

      const models = { admin: Admin, doctor: Doctor, patient: Patient, caregiver: Caregiver };
      const role = user.role.toLowerCase();
      if (models[role]) {
        await models[role].findByIdAndUpdate(user._id, { lastActive: new Date() });
      }

      if (user.status !== 'active') {
        return res.status(403).json({
          message: user.status === 'pending'
            ? 'Your account is pending approval by an admin.'
            : 'Your account is inactive. Please contact support.'
        });
      }

      res.json({
        _id: user._id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, ...extra } = req.body;

    if (!validatePasswordComplexity(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).'
      });
    }

    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const validRoles = ['patient', 'caregiver', 'doctor', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role: role.toLowerCase(),
      id: extra.id || `${role.toUpperCase().substring(0, 3)}${Date.now()}`,
      ...extra
    };

    await VerificationCode.deleteOne({ email: email.toLowerCase() });
    await VerificationCode.create({
      email: email.toLowerCase(),
      code: verificationToken,
      userData,
      createdAt: new Date(),
    });

    try {
      const emailResult = await sendVerificationEmail(userData.email, verificationToken);
      const isDevMode = emailResult.status === 'dev-mode' || emailResult.status === 'fallback-mode';

      res.status(200).json({
        message: isDevMode
          ? 'Verification code (Sandbox Mode): use the code displayed below.'
          : 'Verification code sent to your email! Please check your inbox.',
        email: userData.email,
        ...(isDevMode && { devCode: verificationToken }),
        ...(emailResult.previewUrl && { previewUrl: emailResult.previewUrl })
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      res.status(500).json({ message: 'Error sending verification email. Please try again.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { code, email } = req.body;

    if (!code || !email) {
      return res.status(400).json({ message: 'Email and code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = String(code).trim();

    const verificationRecord = await VerificationCode.findOne({ email: normalizedEmail });

    if (!verificationRecord) {
      return res.status(400).json({ message: 'No verification request found for this email. Please register again.' });
    }

    if (String(verificationRecord.code).trim() !== normalizedCode) {
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    const TEN_MINUTES = 10 * 60 * 1000;
    const recordAge = Date.now() - new Date(verificationRecord.createdAt).getTime();
    if (recordAge > TEN_MINUTES) {
      await VerificationCode.deleteOne({ _id: verificationRecord._id });
      return res.status(400).json({ message: 'Verification code has expired. Please register again.' });
    }

    const { userData } = verificationRecord;

    const pendingUser = new PendingUser({
      ...userData,
      isEmailVerified: true
    });

    await pendingUser.save();

    const admins = await Admin.find({});
    const notifications = admins.map(admin => ({
      id: `NTF-REG-${Date.now()}-${pendingUser._id}`,
      receiverID: admin.id,
      content: `New ${pendingUser.role} registration request: ${pendingUser.name}. Approval required.`,
      type: 'alert',
      date: new Date(),
      read: false
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await VerificationCode.deleteOne({ _id: verificationRecord._id });

    cache.flushAll();

    res.status(201).json({ message: 'Email verified successfully! Your account has been submitted and is pending admin approval before database registration.' });
  } catch (error) {
    console.error('verifyCode error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;

    const models = { admin: Admin, doctor: Doctor, patient: Patient, caregiver: Caregiver };
    let userFound = null;

    for (const model of Object.values(models)) {
      const user = await model.findOne({ email: email.toLowerCase(), verificationToken: token });
      if (user) {
        userFound = user;
        break;
      }
    }

    if (!userFound) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    userFound.isEmailVerified = true;
    userFound.verificationToken = undefined;
    await userFound.save();

    res.status(200).json({ message: 'Email verified successfully! You can now log in after admin approval.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, role, lastname, ...rest } = req.body;

    const models = { admin: Admin, doctor: Doctor, patient: Patient, caregiver: Caregiver };
    const model = models[role?.toLowerCase()];

    if (!model) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updateData = { name, email, phone, address, ...rest };
    if (lastname) updateData.lastname = lastname;

    const updatedUser = await model.findOneAndUpdate(
      { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] },
      updateData,
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    cache.flushAll();

    res.json({
      _id: updatedUser._id,
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: role,
      phone: updatedUser.phone,
      address: updatedUser.address
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, role } = req.body;

    const models = { admin: Admin, doctor: Doctor, patient: Patient, caregiver: Caregiver };
    const model = models[role?.toLowerCase()];

    if (!model) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await model.findOne({ $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = user.matchPassword
      ? await user.matchPassword(currentPassword)
      : await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    if (!validatePasswordComplexity(newPassword)) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const changeEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, newEmail, role } = req.body;

    const models = { admin: Admin, doctor: Doctor, patient: Patient, caregiver: Caregiver };
    const model = models[role?.toLowerCase()];

    if (!model) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await model.findOne({ $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = user.matchPassword
      ? await user.matchPassword(password)
      : await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    user.email = newEmail.toLowerCase();
    await user.save();

    res.json({ message: 'Email updated successfully', email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
