import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import Admin from '../models/Admin.js';
import { getUserNotifications, markAllAsRead } from '../controllers/NotificationController.js';

const MONGODB_URI = "mongodb+srv://minyar1820_db_user:btsjhope1618@cluster0.k4ezadh.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("⚡ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully.");

    // Find a mock receiver (e.g., first active Admin or create a mock ID)
    const admin = await Admin.findOne({});
    const receiverId = admin ? admin.id : "admin-001";
    console.log(`\n🧪 Test: Using receiverID: ${receiverId}`);

    // Create 3 unread notifications
    console.log("- Creating 3 mock unread notifications...");
    const notif1 = new Notification({
      id: `NTF-TEST-1-${Date.now()}`,
      receiverID: receiverId,
      content: "Test Notification 1",
      type: "info",
      date: new Date(),
      read: false
    });
    const notif2 = new Notification({
      id: `NTF-TEST-2-${Date.now()}`,
      receiverID: receiverId,
      content: "Test Notification 2",
      type: "success",
      date: new Date(),
      read: false
    });
    const notif3 = new Notification({
      id: `NTF-TEST-3-${Date.now()}`,
      receiverID: receiverId,
      content: "Test Notification 3",
      type: "alert",
      date: new Date(),
      read: false
    });

    await Promise.all([notif1.save(), notif2.save(), notif3.save()]);

    // Query unread notifications first
    console.log("- Querying user notifications before marking read...");
    const mockReqGet = { params: { userId: receiverId } };
    let getResponseBody = [];
    const mockResGet = {
      status: () => ({
        json: (body) => {
          getResponseBody = body;
        }
      })
    };
    await getUserNotifications(mockReqGet, mockResGet);
    const unreadBefore = getResponseBody.filter(n => !n.read && n.message.startsWith("Test Notification")).length;
    console.log(`  * Unread test notifications found: ${unreadBefore} (Expected: 3)`);

    // Call markAllAsRead
    console.log("- Calling markAllAsRead controller...");
    const mockReqRead = { params: { userId: receiverId } };
    let readResponseBody = {};
    const mockResRead = {
      status: () => ({
        json: (body) => {
          readResponseBody = body;
        }
      })
    };
    await markAllAsRead(mockReqRead, mockResRead);
    console.log(`  * Response Message: ${readResponseBody.message}`);

    // Query notifications again to verify
    console.log("- Verifying in database directly...");
    const notifsAfter = await Notification.find({ receiverID: receiverId, content: /Test Notification/ });
    const allRead = notifsAfter.every(n => n.read === true);
    console.log(`  * All test notifications turned to read: true? ${allRead ? '✅ Yes (Correct!)' : '❌ No (ERROR!)'}`);

    // Clean up
    console.log("\n🧼 Cleaning up test notifications...");
    await Notification.deleteMany({ receiverID: receiverId, content: /Test Notification/ });
    console.log("✅ Cleanup successful.");

    if (!allRead || unreadBefore !== 3) {
      throw new Error("Notifications markAllAsRead verification failed!");
    }

    console.log("\n🏆 Notifications tests passed FLAWLESSLY!");

  } catch (error) {
    console.error("❌ Test script failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

run();
