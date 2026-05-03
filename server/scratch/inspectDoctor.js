import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from '../src/models/Doctor.js';

dotenv.config();

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const doctor = await Doctor.findOne();
    console.log('Doctor structure:', JSON.stringify(doctor, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

inspect();
