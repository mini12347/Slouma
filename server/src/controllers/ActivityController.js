import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Patient from '../models/Patient.js';
import cache from '../config/cache.js';

// @desc    Get all activities for a patient
// @route   GET /api/activities/patient/:patientID
export const getPatientActivities = async (req, res) => {
    try {
        const { patientID } = req.params;
        const activities = await Activity.find({ patientID }).sort({ date: -1 });
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new activity
// @route   POST /api/activities
export const createActivity = async (req, res) => {
    const activityData = req.body;
    const newActivity = new Activity(activityData);
    try {
        await newActivity.save();
        
        // Optionally update patient's last active or specific fields
        await Patient.findOneAndUpdate(
            { $or: [...(mongoose.Types.ObjectId.isValid(activityData.patientID) ? [{ _id: activityData.patientID }] : []), { id: activityData.patientID }] },
            { lastActive: new Date() }
        );
        
        cache.flushAll();

        res.status(201).json(newActivity);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

// @desc    Get activities by logger (Doctor or Caregiver)
// @route   GET /api/activities/logger/:loggerID
export const getActivitiesByLogger = async (req, res) => {
    try {
        const { loggerID } = req.params;
        const activities = await Activity.find({ loggedBy: loggerID }).sort({ date: -1 });
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
