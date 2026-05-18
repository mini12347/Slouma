import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Caregiver from "../models/caregiver.js";

const getUserIdentifiers = async (userId) => {
    const ids = [userId];
    if (mongoose.Types.ObjectId.isValid(userId)) {
        const models = [Admin, Doctor, Patient, Caregiver];
        for (const model of models) {
            const user = await model.findById(userId);
            if (user && user.id) {
                ids.push(user.id);
                break;
            }
        }
    } else {
        const models = [Admin, Doctor, Patient, Caregiver];
        for (const model of models) {
            const user = await model.findOne({ id: userId });
            if (user) {
                ids.push(user._id.toString());
                break;
            }
        }
    }
    return ids;
};

const createNotification = async (req, res) => {
    const notification = req.body;
    const newNotification = new Notification(notification);
    try {
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find();
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOne({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const updateNotification = async (req, res) => {
    const { id } = req.params;
    const notification = req.body;
    try {
        const updatedNotification = await Notification.findOneAndUpdate(
            { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] },
            notification,
            { returnDocument: 'after' }
        );
        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json(updatedNotification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const deleteNotification = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedNotification = await Notification.findOneAndDelete({
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }]
        });
        if (!deletedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const userIds = await getUserIdentifiers(userId);
        const notifications = await Notification.find({ receiverID: { $in: userIds } }).sort({ date: -1 });

        const mapped = notifications.map(n => ({
            id: n._id,
            title: n.type === 'alert' ? 'Alert' : n.type === 'success' ? 'Success' : 'Notification',
            message: n.content,
            time: n.date,
            type: n.type,
            read: n.read
        }));

        res.status(200).json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        const userIds = await getUserIdentifiers(userId);
        await Notification.updateMany({ receiverID: { $in: userIds }, read: false }, { read: true });
        res.status(200).json({ message: 'Marked all as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { createNotification, getNotifications, getNotificationById, updateNotification, deleteNotification, getUserNotifications, markAllAsRead };