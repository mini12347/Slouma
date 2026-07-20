import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Caregiver from '../models/caregiver.js';
import Admin from '../models/Admin.js';
import Message from '../models/Message.js';

const MONGODB_URI = "mongodb+srv://minyar1820_db_user:btsjhope1618@cluster0.k4ezadh.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("⚡ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully.");

    // Find pre-existing Doctor and Caregiver
    const doc = await Doctor.findOne({});
    const cg = await Caregiver.findOne({});

    if (!doc || !cg) {
      console.log("⚠️ Need at least one Doctor and one Caregiver to run this test. Creating mock ones...");
      // (Optional: Create if not found, but we know they exist from previous steps)
    }

    const docId = doc ? (doc.id || doc._id.toString()) : "DOC-MOCK-TEST";
    const cgId = cg ? (cg.id || cg._id.toString()) : "CG-MOCK-TEST";
    console.log(`Using Doctor: ${docId}, Caregiver: ${cgId}`);

    // Create a new Patient with NO links
    const tempEmail = `autolink-${Date.now()}@example.com`;
    const patientData = {
      id: `PAT-LINK-TEST-${Date.now()}`,
      name: "AutoLink",
      lastname: "Tester",
      email: tempEmail,
      password: "TestPassword123!",
      bloodGroup: "O+",
      dateOfBirth: new Date(),
      gender: "Male",
      phone: "1234567890",
      doctorIDs: [],
      caregiverIDs: []
    };

    console.log("\n🧪 Creating a new patient without assigning any doctor or caregiver...");
    const patient = new Patient(patientData);
    await patient.save();

    console.log("- Fetching patient document back from DB...");
    const savedPatient = await Patient.findById(patient._id);
    
    console.log(`  * doctorIDs: ${JSON.stringify(savedPatient.doctorIDs)}`);
    console.log(`  * caregiverIDs: ${JSON.stringify(savedPatient.caregiverIDs)}`);

    const hasDoctor = savedPatient.doctorIDs && savedPatient.doctorIDs.length > 0;
    const hasCaregiver = savedPatient.caregiverIDs && savedPatient.caregiverIDs.length > 0;

    console.log(`  * Automatically linked to Doctor? ${hasDoctor ? '✅ Yes' : '❌ No'}`);
    console.log(`  * Automatically linked to Caregiver? ${hasCaregiver ? '✅ Yes' : '❌ No'}`);

    if (!hasDoctor || !hasCaregiver) {
      throw new Error("Patient was not automatically linked!");
    }

    // Now test that the patient can message their auto-linked doctor and caregiver
    const targetDoc = savedPatient.doctorIDs[0];
    const targetCg = savedPatient.caregiverIDs[0];

    console.log("\n🧪 Testing messaging validation for the auto-linked Doctor...");
    const msgToDoc = new Message({
      senderID: savedPatient.id,
      receiverID: targetDoc,
      message: "Hello Doctor, I was auto-linked to you!",
      date: new Date(),
      time: new Date().toLocaleTimeString()
    });
    await msgToDoc.save();
    console.log("✅ Message to Doctor successfully sent and validated!");

    console.log("\n🧪 Testing messaging validation for the auto-linked Caregiver...");
    const msgToCg = new Message({
      senderID: savedPatient.id,
      receiverID: targetCg,
      message: "Hello Caregiver, I was auto-linked to you!",
      date: new Date(),
      time: new Date().toLocaleTimeString()
    });
    await msgToCg.save();
    console.log("✅ Message to Caregiver successfully sent and validated!");

    // Clean up
    console.log("\n🧼 Cleaning up test documents...");
    await Message.deleteOne({ _id: msgToDoc._id });
    await Message.deleteOne({ _id: msgToCg._id });
    await Patient.deleteOne({ _id: savedPatient._id });
    console.log("✅ Cleanup complete.");

    console.log("\n🏆 Messaging and Auto-linking validation passed FLAWLESSLY!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

run();
