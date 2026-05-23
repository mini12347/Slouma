import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Caregiver from '../models/caregiver.js';
import mongoose from 'mongoose';

export const linkPatientDoctor = async (patientID, doctorID) => {
    if (!patientID || !doctorID) return;
    
    const patientQuery = mongoose.Types.ObjectId.isValid(patientID) 
        ? { $or: [{ _id: patientID }, { id: patientID }] }
        : { id: patientID };
    
    const doctorQuery = mongoose.Types.ObjectId.isValid(doctorID)
        ? { $or: [{ _id: doctorID }, { id: doctorID }] }
        : { id: doctorID };
    
    await Patient.findOneAndUpdate(patientQuery, { $addToSet: { doctorIDs: doctorID } });
    await Doctor.findOneAndUpdate(doctorQuery, { $addToSet: { patientIDs: patientID } });
};

export const linkPatientCaregiver = async (patientID, caregiverID) => {
    if (!patientID || !caregiverID) return;

    const patientQuery = mongoose.Types.ObjectId.isValid(patientID) 
        ? { $or: [{ _id: patientID }, { id: patientID }] }
        : { id: patientID };
    
    const caregiverQuery = mongoose.Types.ObjectId.isValid(caregiverID)
        ? { $or: [{ _id: caregiverID }, { id: caregiverID }] }
        : { id: caregiverID };

    await Patient.findOneAndUpdate(patientQuery, { $addToSet: { caregiverIDs: caregiverID } });

    const updatedCaregiver = await Caregiver.findOneAndUpdate(
        caregiverQuery,
        { $addToSet: { patientIDs: patientID } },
        { returnDocument: 'after' }
    );

    const patient = await Patient.findOne(patientQuery);
    if (patient && (patient.doctorIDs || []).length > 0) {
        for (const drID of patient.doctorIDs) {
            const drQuery = mongoose.Types.ObjectId.isValid(drID)
                ? { $or: [{ _id: drID }, { id: drID }] }
                : { id: drID };
            
            await Caregiver.findOneAndUpdate(caregiverQuery, { $addToSet: { doctorIDs: drID } });
            await Doctor.findOneAndUpdate(drQuery, { $addToSet: { caregiverIDs: caregiverID } });
        }
    }
};

export const linkDoctorCaregiver = async (doctorID, caregiverID) => {
    if (!doctorID || !caregiverID) return;

    const doctorQuery = mongoose.Types.ObjectId.isValid(doctorID)
        ? { $or: [{ _id: doctorID }, { id: doctorID }] }
        : { id: doctorID };
    
    const caregiverQuery = mongoose.Types.ObjectId.isValid(caregiverID)
        ? { $or: [{ _id: caregiverID }, { id: caregiverID }] }
        : { id: caregiverID };

    await Doctor.findOneAndUpdate(doctorQuery, { $addToSet: { caregiverIDs: caregiverID } });
    await Caregiver.findOneAndUpdate(caregiverQuery, { $addToSet: { doctorIDs: doctorID } });
};
