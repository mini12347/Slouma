import mongoose from "mongoose";

const MessageSchema = mongoose.Schema({
    senderID: {
        type: String,
        required: [true, 'enter a sender ID']
    },
    receiverID: {
        type: String,
        required: [true, 'enter a receiver ID']
    },
    message: {
        type: String,
        required: [true, 'enter a message']
    },
    date: {
        type: Date,
        required: [true, 'enter a date']
    },
    time: {
        type: String,
        required: [true, 'enter a time']
    },
});

// Enforce that patients can only message their linked doctors, caregivers, or administrators
MessageSchema.pre('save', async function () {
  const Patient = mongoose.model('Patient');
  const Doctor = mongoose.model('Doctor');
  const Caregiver = mongoose.model('Caregiver');
  const Admin = mongoose.model('Admin');

  const senderId = this.senderID;
  const receiverId = this.receiverID;

  const senderQuery = [{ id: senderId }];
  if (mongoose.Types.ObjectId.isValid(senderId)) senderQuery.push({ _id: senderId });

  // Check if the sender is a Patient
  const patient = await Patient.findOne({ $or: senderQuery });

  if (patient) {
    const receiverQuery = [{ id: receiverId }];
    if (mongoose.Types.ObjectId.isValid(receiverId)) receiverQuery.push({ _id: receiverId });

    // Find the receiver's record as Doctor
    const doctor = await Doctor.findOne({ $or: receiverQuery });
    if (doctor) {
      const isLinked = (patient.doctorIDs || []).includes(doctor.id) || 
                       (patient.doctorIDs || []).includes(doctor._id.toString());
      if (!isLinked) {
        throw new Error('A patient can only message their linked doctor.');
      }
      return;
    }

    // Find the receiver's record as Caregiver
    const caregiver = await Caregiver.findOne({ $or: receiverQuery });
    if (caregiver) {
      const isLinked = (patient.caregiverIDs || []).includes(caregiver.id) || 
                       (patient.caregiverIDs || []).includes(caregiver._id.toString());
      if (!isLinked) {
        throw new Error('A patient can only message their linked caregiver.');
      }
      return;
    }

    // Find the receiver's record as Admin
    const admin = await Admin.findOne({ $or: receiverQuery });
    if (admin) {
      return;
    }

    // If receiver is none of the above roles
    throw new Error('A patient can only message their linked doctors, caregivers, or an administrator.');
  }
});

const Message = mongoose.model('Message', MessageSchema);
export default Message;