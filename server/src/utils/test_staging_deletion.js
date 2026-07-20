import mongoose from 'mongoose';
import PendingUser from '../models/PendingUser.js';
import { deleteUser } from '../controllers/AdminController.js';
import { deletePatient } from '../controllers/patientController.js';

const MONGODB_URI = "mongodb+srv://minyar1820_db_user:btsjhope1618@cluster0.k4ezadh.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("⚡ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully.");

    // TEST 1: AdminController deleteUser for Pending Staging Patient
    const tempId1 = `PAT-STAGING-DEL-TEST-${Date.now()}`;
    console.log(`\n🧪 Test 1: Creating mock PendingUser with custom ID: ${tempId1}`);
    const pendingUser1 = new PendingUser({
      id: tempId1,
      name: "StagingDelete1",
      lastname: "Tester",
      email: `staging-del-1-${Date.now()}@example.com`,
      password: "TestPassword123!",
      role: "Patient",
      phone: "9876543210",
      gender: "Female",
      bloodGroup: "A+",
      dateOfBirth: new Date(),
      isEmailVerified: true
    });
    await pendingUser1.save();

    console.log("- Deleting staging user via AdminController deleteUser...");
    const mockReq1 = {
      params: {
        role: "Patient",
        id: tempId1
      },
      headers: {}
    };
    let responseBody1 = {};
    let responseStatus1 = 0;
    const mockRes1 = {
      status: (code) => {
        responseStatus1 = code;
        return {
          json: (body) => {
            responseBody1 = body;
          }
        };
      }
    };

    await deleteUser(mockReq1, mockRes1);
    console.log(`  * Response Status: ${responseStatus1}`);
    console.log(`  * Response Message: ${responseBody1.message}`);

    const check1 = await PendingUser.findOne({ id: tempId1 });
    console.log(`  * Verification: Staging user deleted? ${!check1 ? '✅ Yes (Correct!)' : '❌ No (ERROR!)'}`);


    // TEST 2: patientController deletePatient fallback for Pending Staging Patient
    const tempId2 = `PAT-STAGING-DEL-FALLBACK-${Date.now()}`;
    console.log(`\n🧪 Test 2: Creating mock PendingUser with custom ID: ${tempId2}`);
    const pendingUser2 = new PendingUser({
      id: tempId2,
      name: "StagingDelete2",
      lastname: "Tester",
      email: `staging-del-2-${Date.now()}@example.com`,
      password: "TestPassword123!",
      role: "Patient",
      phone: "9876543210",
      gender: "Female",
      bloodGroup: "A+",
      dateOfBirth: new Date(),
      isEmailVerified: true
    });
    await pendingUser2.save();

    console.log("- Deleting staging patient via fallback deletePatient...");
    const mockReq2 = {
      params: {
        id: tempId2
      }
    };
    let responseBody2 = {};
    let responseStatus2 = 0;
    const mockRes2 = {
      status: (code) => {
        responseStatus2 = code;
        return {
          json: (body) => {
            responseBody2 = body;
          }
        };
      }
    };

    await deletePatient(mockReq2, mockRes2);
    console.log(`  * Response Status: ${responseStatus2}`);
    console.log(`  * Response Message: ${responseBody2.message}`);

    const check2 = await PendingUser.findOne({ id: tempId2 });
    console.log(`  * Verification: Staging user deleted? ${!check2 ? '✅ Yes (Correct!)' : '❌ No (ERROR!)'}`);

    if (check1 || check2) {
      throw new Error("Staging deletion failed!");
    }
    
    console.log("\n🥇 All Deletion Tests Passed FLAWLESSLY!");

  } catch (error) {
    console.error("❌ Deletion test script failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

run();
