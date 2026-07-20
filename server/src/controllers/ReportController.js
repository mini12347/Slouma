import Report from '../models/Report.js';
import cache from '../config/cache.js';

export const getPatientReports = async (req, res) => {
    try {
        const { patientID } = req.params;
        const reports = await Report.find({ patientID }).sort({ date: -1 });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createReport = async (req, res) => {
    const reportData = req.body;
    const newReport = new Report(reportData);
    try {
        await newReport.save();
        cache.flushAll();
        res.status(201).json(newReport);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const getDoctorReports = async (req, res) => {
    try {
        const { doctorID } = req.params;
        const reports = await Report.find({ doctorID }).sort({ date: -1 });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
