import mongoose from "mongoose";

const MedicationSchema = new mongoose.Schema({
    patientID: {
        type: String,
        required: [true, 'Please add a patient ID']
    },
    prescribedBy: {
        type: String,
        required: [true, 'Please add a doctor ID']
    },
    name: {
        type: String,
        required: [true, 'Please add a medication name']
    },
    dosage: {
        type: String,
        required: [true, 'Please add a dosage']
    },
    frequency: {
        type: String,
        required: [true, 'Please add frequency']
    },
    startDate: Date,
    endDate: Date,
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Discontinued'],
        default: 'Active'
    },
    notes: String,
    caregiverID: String
}, {
    timestamps: true
});

const Medication = mongoose.model('Medication', MedicationSchema);
export default Medication;
