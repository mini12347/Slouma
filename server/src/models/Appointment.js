import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    patientID: {
        type: String,
        required: [true, 'Please add a patient ID']
    },
    doctorID: {
        type: String,
        required: [true, 'Please add a doctor ID']
    },
    caregiverID: {
        type: String
    },
    patientName: String,
    doctorName: String,
    date: {
        type: Date,
        required: [true, 'Please add a date']
    },
    time: {
        type: String,
        required: [true, 'Please add a time']
    },
    type: {
        type: String,
        enum: ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup', 'Other'],
        default: 'Consultation'
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'No-show'],
        default: 'Scheduled'
    },
    reason: String,
    notes: String,
    duration: String
}, {
    timestamps: true
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);
export default Appointment;
