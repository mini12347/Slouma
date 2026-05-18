import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

const MONGODB_URI = "mongodb+srv://minyar1820_db_user:btsjhope1618@cluster0.k4ezadh.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("⚡ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully.\n");

    const count = await Notification.countDocuments({});
    console.log(`Total notifications in database: ${count}`);

    const sampleNotifs = await Notification.find({}).limit(10).sort({ date: -1 });
    console.log("\n=== Last 10 Notifications ===");
    sampleNotifs.forEach(n => {
      console.log(`- ID: ${n._id} | receiverID: ${n.receiverID} | read: ${n.read} | Content: "${n.content.substring(0, 50)}..."`);
    });

  } catch (error) {
    console.error("❌ Error querying database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected.");
  }
}

run();
