import mongoose from 'mongoose';
import Patient from '../models/Patient.js';

const MONGODB_URI = "mongodb+srv://minyar1820_db_user:btsjhope1618@cluster0.k4ezadh.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("⚡ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    
    console.log("🔄 Resetting password for minyar1820@gmail.com...");
    const patient = await Patient.findOne({ email: 'minyar1820@gmail.com' });
    if (patient) {
      patient.password = 'TestPass123!'; // This plain text password will trigger the pre('save') hook to hash it exactly ONCE!
      await patient.save();
      console.log("✅ Password successfully reset to TestPass123!");
    } else {
      console.log("❌ Patient minyar1820@gmail.com not found.");
    }
  } catch (error) {
    console.error("❌ Error resetting password:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

run();
