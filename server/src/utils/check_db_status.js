import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import Caregiver from '../models/caregiver.js';
import Doctor from '../models/Doctor.js';
import Admin from '../models/Admin.js';
import PendingUser from '../models/PendingUser.js';
import VerificationCode from '../models/VerificationCode.js';

const MONGODB_URI = "mongodb+srv://minyar1820_db_user:btsjhope1618@cluster0.k4ezadh.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("⚡ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully.\n");

    // 1. Check all VerificationCode records (waiting for OTP input)
    const verifications = await VerificationCode.find({});
    console.log(`=== VerificationCodes (Waiting for OTP Verification) [Total: ${verifications.length}] ===`);
    verifications.forEach(v => {
      console.log(`- Email: ${v.email} | Code: ${v.code} | Role: ${v.userData?.role} | Created: ${v.createdAt || 'N/A'}`);
    });

    // 2. Check all PendingUser records (email verified, waiting for admin approval)
    const pendings = await PendingUser.find({});
    console.log(`\n=== PendingUsers (Waiting for Admin Approval) [Total: ${pendings.length}] ===`);
    pendings.forEach(p => {
      console.log(`- Email: ${p.email} | Name: ${p.name} ${p.lastname} | Role: ${p.role} | Created: ${p.createdAt || 'N/A'}`);
    });

    // 3. Check for specific email patterns (like "minyar") in primary collections
    console.log(`\n=== Recent accounts in primary database ===`);
    const models = [Patient, Caregiver, Doctor, Admin];
    for (const model of models) {
      const users = await model.find({ email: /minyar/i });
      if (users.length > 0) {
        console.log(`- Found in ${model.modelName}s:`);
        users.forEach(u => {
          console.log(`  * ID: ${u.id || u._id} | Name: ${u.name} | Email: ${u.email} | Status: ${u.status}`);
        });
      }
    }

  } catch (error) {
    console.error("❌ Error querying database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected.");
  }
}

run();
