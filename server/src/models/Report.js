import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
    patientID: {
        type: String,
        required: [true, 'Please add a patient ID']
    },
    doctorID: {
        type: String,
        required: [true, 'Please add a doctor ID']
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['General', 'Surgery', 'Consultation', 'Lab Results', 'Other'],
        default: 'General'
    },
    attachments: [String] 
}, {
    timestamps: true
});

const Report = mongoose.model('Report', ReportSchema);
export default Report;
