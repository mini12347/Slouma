import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import PendingUser from '../models/PendingUser.js';
import { verifyCode } from '../controllers/authController.js';
import { getAdminDashboard, approveUser, deleteUser } from '../controllers/AdminController.js';
import VerificationCode from '../models/VerificationCode.js';
import Admin from '../models/Admin.js';

const MONGODB_URI = "mongodb+srv://minyar1820_db_user:btsjhope1618@cluster0.k4ezadh.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("⚡ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully.");

    // Create a mock verification record
    const tempEmail = `staging-test-${Date.now()}@example.com`;
    console.log(`\n🧪 Step 1: Creating mock verification record for: ${tempEmail}`);
    
    const verificationRecord = new VerificationCode({
      email: tempEmail,
      code: "123456",
      userData: {
        name: "Staging",
        lastname: "Tester",
        email: tempEmail,
        password: "TestPassword123!",
        role: "Patient",
        phone: "9876543210",
        gender: "Female",
        bloodGroup: "A+",
        dateOfBirth: new Date()
      }
    });
    await verificationRecord.save();

    console.log("\n🧪 Step 2: Simulating verification code submission...");
    const mockReqVerify = {
      body: {
        email: tempEmail,
        code: "123456"
      }
    };
    
    let verifyResponseStatus = 0;
    let verifyResponseBody = {};
    const mockResVerify = {
      status: (code) => {
        verifyResponseStatus = code;
        return {
          json: (body) => {
            verifyResponseBody = body;
          }
        };
      }
    };

    await verifyCode(mockReqVerify, mockResVerify);
    console.log(`- Response Status: ${verifyResponseStatus}`);
    console.log(`- Response Message: ${verifyResponseBody.message}`);

    // Verify that user DOES NOT exist in Patient collection but DOES exist in PendingUser staging!
    const inPatientBefore = await Patient.findOne({ email: tempEmail });
    const inPending = await PendingUser.findOne({ email: tempEmail });

    console.log(`\n- Checking collections before approval:`);
    console.log(`  * In Patient Collection: ${inPatientBefore ? '❌ Yes (ERROR!)' : '✅ No (Correct!)'}`);
    console.log(`  * In PendingUser Collection: ${inPending ? '✅ Yes (Correct!)' : '❌ No (ERROR!)'}`);

    if (inPatientBefore || !inPending) {
      throw new Error("Staging registration verification failed: user immediately added to primary database or missing from staging!");
    }

    // Verify they are returned by getAdminDashboard
    console.log("\n🧪 Step 3: Checking if the pending user shows up on the Admin Dashboard...");
    const admin = await Admin.findOne({ status: 'active' });
    if (!admin) {
      throw new Error("No active admin found in the database to run dashboard tests!");
    }

    const mockReqDashboard = {
      params: { id: admin.id }
    };
    let dashboardBody = {};
    const mockResDashboard = {
      status: () => ({
        json: (body) => {
          dashboardBody = body;
        }
      })
    };

    await getAdminDashboard(mockReqDashboard, mockResDashboard);
    const dashboardUser = (dashboardBody.users || []).find(u => u.email === tempEmail);
    console.log(`  * Found in dashboard users: ${dashboardUser ? '✅ Yes' : '❌ No'}`);
    console.log(`  * Dashboard User Status: ${dashboardUser?.status || 'N/A'} (Expected: 'pending')`);

    // Simulate approval
    console.log("\n🧪 Step 4: Simulating Admin Approval...");
    const mockReqApprove = {
      body: {
        id: inPending._id.toString(),
        role: "Patient"
      },
      headers: {
        'x-admin-id': admin.id
      }
    };
    let approveResponseBody = {};
    const mockResApprove = {
      status: () => ({
        json: (body) => {
          approveResponseBody = body;
        }
      })
    };

    await approveUser(mockReqApprove, mockResApprove);
    console.log(`  * Approved User: ${approveResponseBody.name} | Assigned ID: ${approveResponseBody.id}`);

    // Verify collections after approval
    const inPatientAfter = await Patient.findOne({ email: tempEmail });
    const inPendingAfter = await PendingUser.findOne({ email: tempEmail });

    console.log(`\n- Checking collections after approval:`);
    console.log(`  * In Patient Collection: ${inPatientAfter ? '✅ Yes (Correct!)' : '❌ No (ERROR!)'}`);
    console.log(`  * In PendingUser Collection: ${inPendingAfter ? '❌ Yes (ERROR!)' : '✅ No (Correct!)'}`);

    if (!inPatientAfter || inPendingAfter) {
      throw new Error("Staging approval verification failed: user not created in main database or still left in staging!");
    }

    // Clean up
    console.log("\n🧼 Cleaning up test user from main database...");
    await Patient.deleteOne({ email: tempEmail });
    console.log("✅ Cleanup successful.");

  } catch (error) {
    console.error("❌ Test script failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

run();
