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
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let user;
  const dataWithHashedPassword = { ...rest, password: hashedPassword };

  switch (role.toLowerCase()) {
    case 'admin':
      user = new Admin(dataWithHashedPassword);
      break;
    case 'doctor':
      user = new Doctor(dataWithHashedPassword);
      break;
    case 'patient':
      if (!dataWithHashedPassword.lastname) dataWithHashedPassword.lastname = 'Patient';
      if (!dataWithHashedPassword.phone) dataWithHashedPassword.phone = '00000000';
      if (!dataWithHashedPassword.bloodGroup) dataWithHashedPassword.bloodGroup = 'O+';
      if (!dataWithHashedPassword.dateOfBirth) dataWithHashedPassword.dateOfBirth = new Date();
      
      if (dataWithHashedPassword.gender) {
        const g = dataWithHashedPassword.gender.toLowerCase();
        if (g === 'male' || g === 'homme') dataWithHashedPassword.gender = 'Male';
        else if (g === 'female' || g === 'femme') dataWithHashedPassword.gender = 'Female';
        else if (g === 'other' || g === 'autre') dataWithHashedPassword.gender = 'Other';
      } else {
        dataWithHashedPassword.gender = 'Other';
      }
      
      user = new Patient(dataWithHashedPassword);
      break;
    case 'caregiver':
      user = new Caregiver(dataWithHashedPassword);
      break;
    default:
      throw new Error('Invalid role');
  }

  await user.save();
  const userObj = user.toObject();
  userObj.role = role.toLowerCase();
  return userObj;
};
