import { linkPatientDoctor, linkPatientCaregiver, linkDoctorCaregiver } from '../services/linkingService.js';
import cache from '../config/cache.js';

// @desc    Assign a doctor to a patient
// @route   POST /api/links/assign-doctor
export const assignDoctorToPatient = async (req, res) => {
    const { patientID, doctorID } = req.body;
    try {
        await linkPatientDoctor(patientID, doctorID);
        cache.flushAll();
        res.status(200).json({ message: 'Doctor linked to patient successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign a caregiver to a patient
// @route   POST /api/links/assign-caregiver
export const assignCaregiverToPatient = async (req, res) => {
    const { patientID, caregiverID } = req.body;
    try {
        await linkPatientCaregiver(patientID, caregiverID);
        cache.flushAll();
        res.status(200).json({ message: 'Caregiver linked to patient successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Link Doctor and Caregiver
// @route   POST /api/links/link-doctor-caregiver
export const linkDoctorAndCaregiver = async (req, res) => {
    const { doctorID, caregiverID } = req.body;
    try {
        await linkDoctorCaregiver(doctorID, caregiverID);
        cache.flushAll();
        res.status(200).json({ message: 'Doctor and Caregiver linked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
