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

  // Check if the sender is a Patient
  const patient = await Patient.findOne({
    $or: [
      { id: senderId },
      { _id: mongoose.Types.ObjectId.isValid(senderId) ? senderId : null }
    ]
  });

  if (patient) {
    // Find the receiver's record as Doctor
    const doctor = await Doctor.findOne({
      $or: [
        { id: receiverId },
        { _id: mongoose.Types.ObjectId.isValid(receiverId) ? receiverId : null }
      ]
    });
    if (doctor) {
      const isLinked = (patient.doctorIDs || []).includes(doctor.id) || 
                       (patient.doctorIDs || []).includes(doctor._id.toString());
      if (!isLinked) {
        throw new Error('A patient can only message their linked doctor.');
      }
      return;
    }

    // Find the receiver's record as Caregiver
    const caregiver = await Caregiver.findOne({
      $or: [
        { id: receiverId },
        { _id: mongoose.Types.ObjectId.isValid(receiverId) ? receiverId : null }
      ]
    });
    if (caregiver) {
      const isLinked = (patient.caregiverIDs || []).includes(caregiver.id) || 
                       (patient.caregiverIDs || []).includes(caregiver._id.toString());
      if (!isLinked) {
        throw new Error('A patient can only message their linked caregiver.');
      }
      return;
    }

    // Find the receiver's record as Admin
    const admin = await Admin.findOne({
      $or: [
        { id: receiverId },
        { _id: mongoose.Types.ObjectId.isValid(receiverId) ? receiverId : null }
      ]
    });
    if (admin) {
      return;
    }

    // If receiver is none of the above roles
    throw new Error('A patient can only message their linked doctors, caregivers, or an administrator.');
  }
});

const Message = mongoose.model('Message', MessageSchema);
export default Message;