import mongoose from "mongoose";
import Caregiver from "../models/caregiver.js";
import Patient from "../models/Patient.js";
import Notification from "../models/Notification.js";
import cache from "../config/cache.js";

const createCaregiver = async (req, res) => {
    const caregiver = req.body;
    const newCaregiver = new Caregiver(caregiver);
    try {
        await newCaregiver.save();
        cache.flushAll();
        res.status(201).json(newCaregiver);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

const getCaregivers = async (req, res) => {
    try {
        const caregivers = await Caregiver.find();
        res.status(200).json(caregivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getCaregiverById = async (req, res) => {
    try {
        const { id } = req.params;
        const caregiver = await Caregiver.findOne({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!caregiver) {
            return res.status(404).json({ message: 'Caregiver not found' });
        }
        res.status(200).json(caregiver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateCaregiver = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const query = { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] };

        // findOne + save() so Mongoose encryption setters fire on sensitive fields
        const caregiver = await Caregiver.findOne(query);
        if (!caregiver) {
            return res.status(404).json({ message: 'Caregiver not found' });
        }

        // Apply fields individually — setters will encrypt name/lastname/phone
        const ALLOWED = ['name', 'lastname', 'email', 'phone', 'address', 'status', 'patientIDs'];
        ALLOWED.forEach(field => {
            if (data[field] !== undefined) caregiver[field] = data[field];
        });

        const updatedCaregiver = await caregiver.save();
        cache.flushAll();
        res.status(200).json(updatedCaregiver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteCaregiver = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCaregiver = await Caregiver.findOneAndDelete({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!deletedCaregiver) {
            return res.status(404).json({ message: 'Caregiver not found' });
        }
        cache.flushAll();
        res.status(200).json({ message: 'Caregiver deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

import Doctor from "../models/Doctor.js";
import Activity from "../models/Activity.js";
import Appointment from "../models/Appointment.js";

const getCaregiverDashboard = async (req, res) => {
    try {
        const { id } = req.params;
        const caregiver = await Caregiver.findOne({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!caregiver) return res.status(404).json({ message: 'Caregiver not found' });
        
        const allPatients = await Patient.find();
        let myPatients = allPatients.filter(p => 
            caregiver.patientIDs.includes(p._id.toString()) || 
            caregiver.patientIDs.includes(p.id) ||
            (p.caregiverIDs && (p.caregiverIDs.includes(caregiver._id.toString()) || p.caregiverIDs.includes(caregiver.id)))
        );

        // Fetch doctors for these patients
        const doctorIDs = [...new Set(myPatients.flatMap(p => p.doctorIDs || []))];
        const doctors = await Doctor.find({
            $or: [{ id: { $in: doctorIDs } }, { _id: { $in: doctorIDs } }]
        });

        // Fetch appointments for these patients
        const patientIDs = myPatients.map(p => p.id || p._id.toString());
        const appointments = await Appointment.find({
            patientID: { $in: patientIDs }
        }).sort({ date: 1 });

        // Fetch recent activities
        const activities = await Activity.find({
            patientID: { $in: patientIDs }
        }).sort({ date: -1 }).limit(20);

        const notifications = await Notification.find({ receiverID: id }).sort({ date: -1 }).limit(10);
        
        res.status(200).json({
            caregiver,
            patients: myPatients,
            doctors,
            appointments,
            activities,
            notifications
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = req.body;
        const caregiver = await Caregiver.findOneAndUpdate(
            { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] },
            { $push: { tasks: task } },
            { returnDocument: 'after' }
        );
        res.status(200).json(caregiver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { id, taskId } = req.params;
        const { status } = req.body;
        const caregiver = await Caregiver.findOneAndUpdate(
            { 
                $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }],
                "tasks._id": taskId
            },
            { $set: { "tasks.$.status": status } },
            { returnDocument: 'after' }
        );
        res.status(200).json(caregiver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export { createCaregiver, getCaregivers, getCaregiverById, updateCaregiver, deleteCaregiver, getCaregiverDashboard, addTask, updateTaskStatus };

