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

    // Create a new temporary Patient and Doctor to test validation
    const tempPatientId = `PAT-TEST-${Date.now()}`;
    const tempDoctorId = `DOC-TEST-${Date.now()}`;

    const patient = new Patient({
      id: tempPatientId,
      name: "Test Patient",
      lastname: "Validation",
      email: `${tempPatientId}@example.com`,
      bloodGroup: "O+",
      dateOfBirth: new Date(),
      gender: "Male",
      phone: "1234567890",
      password: "TestPassword123!",
      status: "active",
      doctorIDs: [] // empty! Not linked!
    });
    await patient.save();

    const doctor = new Doctor({
      id: tempDoctorId,
      name: "Test Doctor",
      lastname: "Validation",
      email: `${tempDoctorId}@example.com`,
      phone: "0987654321",
      password: "TestPassword123!",
      status: "active"
    });
    await doctor.save();

    console.log("\n🧪 Test Case 1: Message to a UNLINKED Doctor (Should fail)...");
    const invalidMsg = new Message({
      senderID: tempPatientId,
      receiverID: tempDoctorId,
      message: "Hello doctor, are you there?",
      date: new Date(),
      time: new Date().toLocaleTimeString()
    });

    try {
      await invalidMsg.save();
      console.log("❌ Test Case 1 Failed: Message was saved despite not being linked!");
    } catch (err) {
      console.log("✅ Test Case 1 Passed: Validation correctly blocked saving! Error message:", err.message);
    }

    console.log("\n🧪 Test Case 2: Linking doctor to patient and sending message (Should pass)...");
    patient.doctorIDs.push(doctor.id);
    await patient.save();

    const validMsg = new Message({
      senderID: tempPatientId,
      receiverID: tempDoctorId,
      message: "Hello doctor, I am now linked!",
      date: new Date(),
      time: new Date().toLocaleTimeString()
    });

    try {
      await validMsg.save();
      console.log("✅ Test Case 2 Passed: Message saved successfully once linked!");
      // Clean up message
      await Message.deleteOne({ _id: validMsg._id });
    } catch (err) {
      console.log("❌ Test Case 2 Failed: Could not save message even when linked!", err.message);
    }

    // Clean up test documents
    console.log("\n🧼 Cleaning up test documents...");
    await Patient.deleteOne({ _id: patient._id });
    await Doctor.deleteOne({ _id: doctor._id });
    console.log("✅ Cleaned up successfully.");

  } catch (error) {
    console.error("❌ Error running validation test:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

run();
