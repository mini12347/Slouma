import mongoose from 'mongoose';

const PendingUserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  lastname: {
    type: String,
    required: [true, 'Please add a lastname']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  role: {
    type: String,
    required: [true, 'Please specify a role'],
    enum: ['Patient', 'Doctor', 'Caregiver', 'Admin'],
    set: function (val) {
      if (!val) return val;
      return val.trim().charAt(0).toUpperCase() + val.trim().slice(1).toLowerCase();
    }
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  gender: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  bloodGroup: {
    type: String
  },
  address: {
    type: String
  },
  specialty: {
    type: String
  },
  doctorIDs: [String],
  caregiverIDs: [String],
  isEmailVerified: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const PendingUser = mongoose.model('PendingUser', PendingUserSchema);
export default PendingUser;
