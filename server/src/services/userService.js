import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Caregiver from '../models/caregiver.js';

export const findUserByEmail = async (email) => {
  const models = [Admin, Doctor, Patient, Caregiver];
  for (const model of models) {
    const user = await model.findOne({ email: email.toLowerCase() });
    if (user) {
      const userObj = user.toObject();
      userObj.role = model.modelName.toLowerCase();
      return userObj;
    }
  }
  return null;
};

export const verifyPassword = async (user, password) => {
  return await bcrypt.compare(password, user.password);
};

export const createUser = async (userData) => {
  const { role, password, ...rest } = userData;

  let user;
  const dataWithPassword = { ...rest, password };

  switch (role.toLowerCase()) {
    case 'admin':
      user = new Admin(dataWithPassword);
      break;
    case 'doctor':
      user = new Doctor(dataWithPassword);
      break;
    case 'patient':
      if (!dataWithPassword.lastname) dataWithPassword.lastname = 'Patient';
      if (!dataWithPassword.phone) dataWithPassword.phone = '00000000';
      if (!dataWithPassword.bloodGroup) dataWithPassword.bloodGroup = 'O+';
      if (!dataWithPassword.dateOfBirth) dataWithPassword.dateOfBirth = new Date();
      
      if (dataWithPassword.gender) {
        const g = dataWithPassword.gender.toLowerCase();
        if (g === 'male' || g === 'homme') dataWithPassword.gender = 'Male';
        else if (g === 'female' || g === 'femme') dataWithPassword.gender = 'Female';
        else if (g === 'other' || g === 'autre') dataWithPassword.gender = 'Other';
      } else {
        dataWithPassword.gender = 'Other';
      }
      
      user = new Patient(dataWithPassword);
      break;
    case 'caregiver':
      user = new Caregiver(dataWithPassword);
      break;
    default:
      throw new Error('Invalid role');
  }

  await user.save();
  const userObj = user.toObject();
  userObj.role = role.toLowerCase();
  return userObj;
};
