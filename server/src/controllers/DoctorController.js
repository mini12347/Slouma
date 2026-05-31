import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Notification from "../models/Notification.js";
import cache from "../config/cache.js";

export const createDoctor = async (req, res) => {
    const doctor = req.body;
    const newDoctor = new Doctor(doctor);
    try {
        await newDoctor.save();
        cache.flushAll();
        res.status(201).json(newDoctor);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findOne({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateDoctor = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const query = { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] };

        // findOne + save() so Mongoose encryption setters fire on sensitive fields
        const doctor = await Doctor.findOne(query);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Apply fields individually — setters will encrypt name/lastname/phone/address
        const ALLOWED = ['name', 'lastname', 'email', 'phone', 'address',
                         'status', 'specialty', 'department', 'patientIDs', 'caregiverIDs'];
        ALLOWED.forEach(field => {
            if (data[field] !== undefined) doctor[field] = data[field];
        });

        const updatedDoctor = await doctor.save();
        cache.flushAll();
        res.status(200).json(updatedDoctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteDoctor = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedDoctor = await Doctor.findOneAndDelete({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!deletedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        cache.flushAll();
        res.status(200).json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getDoctorDashboard = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findOne({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        
        const allPatients = await Patient.find();
        let myPatients = allPatients.filter(p => 
            doctor.patientIDs.includes(p._id.toString()) || 
            doctor.patientIDs.includes(p.id) || 
            (p.doctorIDs && (p.doctorIDs.includes(doctor._id.toString()) || p.doctorIDs.includes(doctor.id)))
        );

        const notifications = await Notification.find({ receiverID: id }).sort({ date: -1 }).limit(10);
        
        // Fetch tasks from caregivers for doctor's patients
        const Caregiver = await import('../models/caregiver.js').then(m => m.default);
        const tasks = [];
        for (const patient of myPatients) {
            if (patient.caregiverIDs && patient.caregiverIDs.length > 0) {
                for (const cgId of patient.caregiverIDs) {
                    try {
                        const caregiver = await Caregiver.findOne({
                            $or: [{ _id: mongoose.Types.ObjectId.isValid(cgId) ? cgId : null }, { id: cgId }]
                        });
                        if (caregiver && caregiver.tasks) {
                            caregiver.tasks.forEach(task => {
                                tasks.push({
                                    ...task._doc || task,
                                    caregiverId: caregiver.id || caregiver._id.toString(),
                                    caregiverName: caregiver.name,
                                    patientId: patient.id || patient._id.toString(),
                                    patientName: patient.name
                                });
                            });
                        }
                    } catch (err) {
                        console.error('Error fetching caregiver tasks:', err);
                    }
                }
            }
        }
        
        res.status(200).json({
            doctor,
            patients: myPatients,
            notifications,
            tasks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addPrescription = async (req, res) => {
    const { id } = req.params;
    const { patientId, medications } = req.body;
    
    try {
        const doctor = await Doctor.findOne({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        
        const newPrescription = {
            patientID: patientId,
            medications: Array.isArray(medications) ? medications : [medications],
            date: new Date()
        };
        doctor.prescriptions.push(newPrescription);
        await doctor.save();
        
        const patient = await Patient.findOne({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(patientId) ? patientId : null }, { id: patientId }]
        });
        if (patient) {
            // Add medications to current list
            const medsToAdd = Array.isArray(medications) ? medications : [medications];
            patient.medications.push(...medsToAdd);
            
            // Link the full prescription
            patient.prescriptions.push({
                doctorID: doctor.id || doctor._id.toString(),
                medications: medsToAdd,
                date: new Date(),
                status: 'Active'
            });
            await patient.save();
        }
        
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addAppointment = async (req, res) => {
    const { id } = req.params;
    const appointmentData = req.body;
    
    try {
        const { date, time } = appointmentData;
        const appDate = new Date(date);
        const now = new Date();
        
        // Check if date is in the past
        const todayAtMidnight = new Date();
        todayAtMidnight.setHours(0, 0, 0, 0);
        
        if (appDate < todayAtMidnight) {
            return res.status(400).json({ message: 'Cannot book appointments in the past' });
        }

        // Check business hours (08:00 - 21:00)
        const [hours, minutes] = time.split(':').map(Number);
        if (hours < 8 || (hours >= 21 && minutes > 0) || hours > 21) {
            return res.status(400).json({ message: 'Appointments must be between 08:00 and 21:00' });
        }

        // If booking for today, check if time has already passed
        if (appDate.toDateString() === now.toDateString()) {
            const appTime = new Date();
            appTime.setHours(hours, minutes, 0, 0);
            if (appTime < now) {
                return res.status(400).json({ message: 'Cannot book a time that has already passed today' });
            }
        }

        const doctor = await Doctor.findOne({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        
        doctor.appointments.push(appointmentData);
        await doctor.save();
        
        if (appointmentData.patientId) {
            const patient = await Patient.findOne({
                $or: [{ _id: mongoose.Types.ObjectId.isValid(appointmentData.patientId) ? appointmentData.patientId : null }, { id: appointmentData.patientId }]
            });
            if (patient) {
                patient.appointments.push({
                    date: appointmentData.date,
                    time: appointmentData.time,
                    doctorID: id,
                    reason: appointmentData.type
                });
                await patient.save();
            }
        }
        
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAppointment = async (req, res) => {
    const { id, appointmentId } = req.params;
    try {
        const doctor = await Doctor.findOne({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        
        doctor.appointments = doctor.appointments.filter(app => 
            app._id.toString() !== appointmentId && app.id !== appointmentId
        );
        await doctor.save();
        
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePrescription = async (req, res) => {
    const { id, prescriptionId } = req.params;
    try {
        const doctor = await Doctor.findOne({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const pres = doctor.prescriptions.find(p =>
            (p._id && p._id.toString() === prescriptionId) || p.id === prescriptionId
        );
        const patientId = pres?.patientID;

        doctor.prescriptions = doctor.prescriptions.filter(p =>
            !(p._id && p._id.toString() === prescriptionId) && p.id !== prescriptionId
        );
        await doctor.save();

        // Mirror deletion on patient
        if (patientId) {
            const patient = await Patient.findOne({
                $or: [{ _id: mongoose.Types.ObjectId.isValid(patientId) ? patientId : null }, { id: patientId }]
            });
            if (patient) {
                patient.prescriptions = (patient.prescriptions || []).filter(p =>
                    !(p._id && p._id.toString() === prescriptionId) && p.id !== prescriptionId
                );
                await patient.save();
            }
        }

        res.status(200).json({ message: 'Prescription deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePrescription = async (req, res) => {
    const { id, prescriptionId } = req.params;
    const { medications, status } = req.body;
    try {
        const doctor = await Doctor.findOne({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        
        const presIndex = doctor.prescriptions.findIndex(p => 
            (p._id && p._id.toString() === prescriptionId) || p.id === prescriptionId
        );
        if (presIndex === -1) return res.status(404).json({ message: 'Prescription not found' });
        
        if (medications) doctor.prescriptions[presIndex].medications = medications;
        if (status) doctor.prescriptions[presIndex].status = status;
        
        await doctor.save();

        // Also update patient's linked prescription if found
        const patientId = doctor.prescriptions[presIndex].patientID;
        const patient = await Patient.findOne({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(patientId) ? patientId : null }, { id: patientId }]
        });
        if (patient && patient.prescriptions) {
            const pPresIndex = patient.prescriptions.findIndex(p => 
                (p._id && p._id.toString() === prescriptionId) || p.id === prescriptionId
            );
            if (pPresIndex !== -1) {
                if (medications) patient.prescriptions[pPresIndex].medications = medications;
                if (status) patient.prescriptions[pPresIndex].status = status;
                await patient.save();
            }
        }

        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};