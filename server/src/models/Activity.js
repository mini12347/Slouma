import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
    patientID: {
        type: String,
        required: [true, 'Please add a patient ID']
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: String,
    type: {
        type: String,
        enum: ['Medical', 'Exercise', 'Diet', 'Incident', 'Medication', 'Vitals', 'Emergency', 'Other'],
        default: 'Other'
    },

    date: {
        type: Date,
        default: Date.now
    },
    loggedBy: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['doctor', 'caregiver', 'patient'],
        required: true
    }
}, {
    timestamps: true
});

const Activity = mongoose.model('Activity', ActivitySchema);
export default Activity;
