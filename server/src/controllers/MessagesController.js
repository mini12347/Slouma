import mongoose from "mongoose";
import Message from "../models/Message.js";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Caregiver from "../models/caregiver.js";
export const createMessage = async (req, res) => {
    const message = req.body;
    const newMessage = new Message(message);
    try {
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}
export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find();
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const getMessageById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid message ID format' });
        }
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const updateMessage = async (req, res) => {
    const { id } = req.params;
    const message = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid message ID format' });
        }
        const updatedMessage = await Message.findByIdAndUpdate(id, message, { new: true });
        if (!updatedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const deleteMessage = async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid message ID format' });
        }
        const deletedMessage = await Message.findByIdAndDelete(id);
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getContacts = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.query;

        const toContact = (u, r) => {
            if (!u) return null;
            const uid = u.id || u._id?.toString();
            const uname = u.name || '';
            const ulast = u.lastname || '';
            return {
                id: uid,
                name: (uname + ' ' + ulast).trim() || 'Utilisateur',
                email: u.email || '',
                phone: u.phone || '',
                role: r,
                avatar: u.image || `https://i.pravatar.cc/150?u=${uid}`,
                status: 'offline',
                lastMsg: '',
                time: '',
                unread: 0
            };
        };

        let contacts = [];

        // Common helper for Admin
        const getOneAdmin = async () => {
            return await Admin.findOne({ status: 'active' });
        };

        if (role === 'doctor') {
            const doctorQuery = [{ id: { $regex: new RegExp(`^${id}$`, 'i') } }];
            if (mongoose.Types.ObjectId.isValid(id)) doctorQuery.push({ _id: id });
            const doctor = await Doctor.findOne({ $or: doctorQuery });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

            const allPatients = await Patient.find({});
            const myPatients = allPatients.filter(p =>
                (doctor.patientIDs || []).includes(p._id.toString()) ||
                (doctor.patientIDs || []).includes(p.id) ||
                (p.doctorIDs && (p.doctorIDs.includes(doctor._id.toString()) || p.doctorIDs.includes(doctor.id)))
            );

            const allCaregivers = await Caregiver.find({});
            const cgIDSet = new Set(myPatients.flatMap(p => p.caregiverIDs || []));
            const myCaregivers = allCaregivers.filter(c =>
                cgIDSet.has(c._id.toString()) || cgIDSet.has(c.id)
            );

            const otherDoctors = await Doctor.find({ _id: { $ne: doctor._id } });
            const admin = await getOneAdmin();

            contacts = [
                ...myPatients.map(p => toContact(p, 'patient')).filter(Boolean),
                ...myCaregivers.map(c => toContact(c, 'caregiver')).filter(Boolean),
                ...otherDoctors.map(d => toContact(d, 'doctor')).filter(Boolean),
                ...(admin ? [toContact(admin, 'admin')] : [])
            ];

        } else if (role === 'caregiver') {
            const caregiverQuery = [{ id: { $regex: new RegExp(`^${id}$`, 'i') } }];
            if (mongoose.Types.ObjectId.isValid(id)) caregiverQuery.push({ _id: id });
            const caregiver = await Caregiver.findOne({ $or: caregiverQuery });
            if (!caregiver) return res.status(404).json({ message: 'Caregiver not found' });

            const allPatients = await Patient.find({});
            const myPatients = allPatients.filter(p =>
                (caregiver.patientIDs || []).includes(p._id.toString()) ||
                (caregiver.patientIDs || []).includes(p.id) ||
                (p.caregiverIDs && (p.caregiverIDs.includes(caregiver._id.toString()) || p.caregiverIDs.includes(caregiver.id)))
            );

            const allDoctors = await Doctor.find({});
            const drIDSet = new Set(myPatients.flatMap(p => p.doctorIDs || []));
            const myDoctors = allDoctors.filter(d =>
                drIDSet.has(d._id.toString()) || drIDSet.has(d.id)
            );

            const admin = await getOneAdmin();

            contacts = [
                ...myPatients.map(p => toContact(p, 'patient')).filter(Boolean),
                ...myDoctors.map(d => toContact(d, 'doctor')).filter(Boolean),
                ...(admin ? [toContact(admin, 'admin')] : [])
            ];

        } else if (role === 'patient') {
            const patientQuery = [{ id: { $regex: new RegExp(`^${id}$`, 'i') } }];
            if (mongoose.Types.ObjectId.isValid(id)) patientQuery.push({ _id: id });
            const patient = await Patient.findOne({ $or: patientQuery });
            if (!patient) return res.status(404).json({ message: 'Patient not found' });

            const drIDs = patient.doctorIDs || [];
            const cgIDs = patient.caregiverIDs || [];

            const allDoctors = await Doctor.find({});
            const myDoctors = allDoctors.filter(d =>
                drIDs.includes(d._id.toString()) || drIDs.includes(d.id)
            );

            const allCaregivers = await Caregiver.find({});
            const myCaregivers = allCaregivers.filter(c =>
                cgIDs.includes(c._id.toString()) || cgIDs.includes(c.id)
            );

            const admin = await getOneAdmin();

            contacts = [
                ...myDoctors.map(d => toContact(d, 'doctor')).filter(Boolean),
                ...myCaregivers.map(c => toContact(c, 'caregiver')).filter(Boolean),
                ...(admin ? [toContact(admin, 'admin')] : [])
            ];

        } else {
            const [patients, doctors, caregivers, admins] = await Promise.all([
                Patient.find({}),
                Doctor.find({}),
                Caregiver.find({}),
                Admin.find({})
            ]);
            contacts = [
                ...patients.map(p => toContact(p, 'patient')).filter(Boolean),
                ...doctors.map(d => toContact(d, 'doctor')).filter(Boolean),
                ...caregivers.map(c => toContact(c, 'caregiver')).filter(Boolean),
                ...admins.map(a => toContact(a, 'admin')).filter(Boolean)
            ];
        }

        // --- Remove Self and Duplicates ---
        contacts = contacts.filter(c => c.id && c.id.toString() !== id?.toString());
        const seen = new Set();
        contacts = contacts.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });

        // --- Optimize Last Message Retrieval ---
        const contactIds = contacts.map(c => c.id);
        const lastMessages = await Message.find({
            $or: [
                { senderID: id, receiverID: { $in: contactIds } },
                { receiverID: id, senderID: { $in: contactIds } }
            ]
        }).sort({ date: -1, time: -1 });

        // Map last messages to contacts
        for (let contact of contacts) {
            const msg = lastMessages.find(m => 
                (m.senderID === id && m.receiverID === contact.id) || 
                (m.receiverID === id && m.senderID === contact.id)
            );
            if (msg) {
                contact.lastMsg = msg.message;
                contact.time = msg.time;
            }
        }

        res.status(200).json(contacts);
    } catch (error) {
        console.error('getContacts error:', error);
        res.status(500).json({ message: error.message });
    }
}

export const blockUser = async (req, res) => {
    try {
        const { userId, contactId } = req.params;
        const result = await Message.deleteMany({
            $or: [
                { senderID: userId, receiverID: contactId },
                { senderID: contactId, receiverID: userId }
            ]
        });
        res.status(200).json({ message: `Blocked. ${result.deletedCount} messages deleted.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getChatHistory = async (req, res) => {
    try {
        const { userId, contactId } = req.params;
        
        const messages = await Message.find({
            $or: [
                { senderID: userId?.toString(), receiverID: contactId?.toString() },
                { senderID: contactId?.toString(), receiverID: userId?.toString() },
                // Case-insensitive fallbacks for custom IDs
                { senderID: userId?.toLowerCase(), receiverID: contactId?.toLowerCase() },
                { senderID: contactId?.toLowerCase(), receiverID: userId?.toLowerCase() }
            ]
        }).sort({ date: 1, time: 1 });

        const mapped = messages.map(m => ({
            id: m._id,
            text: m.message,
            time: m.time,
            isMe: m.senderID?.toLowerCase() === userId?.toLowerCase(),
            status: 'sent'
        }));

        res.status(200).json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}