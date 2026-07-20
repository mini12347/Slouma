import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import Caregiver from '../models/caregiver.js';
import Doctor from '../models/Doctor.js';
import Admin from '../models/Admin.js';

const MONGODB_URI = "mongodb+srv://minyar1820_db_user:btsjhope1618@cluster0.k4ezadh.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("⚡ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully.");

    // 1. Approve all pending users
    console.log("\n🔄 Approving all pending users and verifying their emails...");
    const models = [Patient, Caregiver, Doctor, Admin];
    for (const model of models) {
      const result = await model.updateMany(
        { $or: [{ status: 'pending' }, { isEmailVerified: false }] },
        { $set: { status: 'active', isEmailVerified: true } }
      );
      console.log(`- ${model.modelName}s updated:`, result.modifiedCount);
    }

    // 2. Fetch and print all active users for easy testing
    console.log("\n📋 Current Active Users in Database:");
    for (const model of models) {
      const users = await model.find({ status: 'active' });
      console.log(`\n--- ${model.modelName}s (${users.length}) ---`);
      users.forEach(u => {
        console.log(`ID: ${u.id || u._id} | Name: ${u.name} | Email: ${u.email} | Status: ${u.status}`);
      });
    }

  } catch (error) {
    console.error("❌ Error running script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB.");
  }
}

run();
