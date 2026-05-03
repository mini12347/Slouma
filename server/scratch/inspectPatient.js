import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Patient from '../src/models/Patient.js';

dotenv.config();

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const patient = await Patient.findOne();
    console.log('Patient structure:', JSON.stringify(patient, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

inspect();
