import express from "express";
import { createNotification, getNotifications, getNotificationById, updateNotification, deleteNotification, getUserNotifications, markAllAsRead } from "../controllers/NotificationController.js";
const routerN = express.Router();
routerN.post('/', createNotification);
routerN.get('/', getNotifications);

routerN.get('/user/:userId', getUserNotifications);
routerN.put('/user/:userId/read', markAllAsRead);

routerN.get('/:id', getNotificationById);
routerN.put('/:id', updateNotification);
routerN.delete('/:id', deleteNotification);
export default routerN;
