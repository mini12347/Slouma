import mongoose from "mongoose";
import Notification from "../models/Notification.js";
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
        const notifications = await Notification.find({ receiverID: userId }).sort({ date: -1 });

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
        await Notification.updateMany({ receiverID: userId, read: false }, { read: true });
        res.status(200).json({ message: 'Marked all as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { createNotification, getNotifications, getNotificationById, updateNotification, deleteNotification, getUserNotifications, markAllAsRead };