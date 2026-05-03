import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Caregiver from '../models/caregiver.js';
import mongoose from 'mongoose';

export const linkPatientDoctor = async (patientID, doctorID) => {
    if (!patientID || !doctorID) return;
    
    await Patient.findOneAndUpdate(
        { $or: [{ id: patientID }, { _id: mongoose.Types.ObjectId.isValid(patientID) ? patientID : null }] },
        { $addToSet: { doctorIDs: doctorID } }
    );

    await Doctor.findOneAndUpdate(
        { $or: [{ id: doctorID }, { _id: mongoose.Types.ObjectId.isValid(doctorID) ? doctorID : null }] },
        { $addToSet: { patientIDs: patientID } }
    );
};

export const linkPatientCaregiver = async (patientID, caregiverID) => {
    if (!patientID || !caregiverID) return;

    await Patient.findOneAndUpdate(
        { $or: [{ id: patientID }, { _id: mongoose.Types.ObjectId.isValid(patientID) ? patientID : null }] },
        { $addToSet: { caregiverIDs: caregiverID } }
    );

    const updatedCaregiver = await Caregiver.findOneAndUpdate(
        { $or: [{ id: caregiverID }, { _id: mongoose.Types.ObjectId.isValid(caregiverID) ? caregiverID : null }] },
        { $addToSet: { patientIDs: patientID } },
        { returnDocument: 'after' }
    );

    const patient = await Patient.findOne({ $or: [{ id: patientID }, { _id: mongoose.Types.ObjectId.isValid(patientID) ? patientID : null }] });
    if (patient && (patient.doctorIDs || []).length > 0) {
        for (const drID of patient.doctorIDs) {
            await Caregiver.findOneAndUpdate(
                { $or: [{ id: caregiverID }, { _id: mongoose.Types.ObjectId.isValid(caregiverID) ? caregiverID : null }] },
                { $addToSet: { doctorIDs: drID } }
            );
            await Doctor.findOneAndUpdate(
                { $or: [{ id: drID }, { _id: mongoose.Types.ObjectId.isValid(drID) ? drID : null }] },
                { $addToSet: { caregiverIDs: caregiverID } }
            );
        }
    }
};

export const linkDoctorCaregiver = async (doctorID, caregiverID) => {
    if (!doctorID || !caregiverID) return;

    await Doctor.findOneAndUpdate(
        { $or: [{ id: doctorID }, { _id: mongoose.Types.ObjectId.isValid(doctorID) ? doctorID : null }] },
        { $addToSet: { caregiverIDs: caregiverID } }
    );

    await Caregiver.findOneAndUpdate(
        { $or: [{ id: caregiverID }, { _id: mongoose.Types.ObjectId.isValid(caregiverID) ? caregiverID : null }] },
        { $addToSet: { doctorIDs: doctorID } }
    );
};
