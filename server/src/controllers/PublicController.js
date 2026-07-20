import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

export const getPublicStats = async (req, res) => {
    try {
        const patientsCount = await Patient.countDocuments();
        const doctorsCount = await Doctor.countDocuments();

        res.status(200).json({
            patientsCount,
            doctorsCount,
            satisfactionRate: 90.4,
            availability: "24/7"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
