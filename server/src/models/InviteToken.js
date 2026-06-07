import mongoose from 'mongoose';
import crypto from 'crypto';

const inviteTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  role: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

inviteTokenSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString('hex');
};

inviteTokenSchema.statics.hashToken = function (token) {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const InviteToken = mongoose.model('InviteToken', inviteTokenSchema);
export default InviteToken;
