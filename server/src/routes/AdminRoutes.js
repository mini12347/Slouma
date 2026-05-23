import { 
    createAdmin, getAdmins, getAdminById, updateAdmin, deleteAdmin, 
    getAdminDashboard, createUser, deleteUser, updateUser, approveUser, generateReport,
    broadcastNotification, broadcastMessage
} from "../controllers/AdminController.js";
import express from "express";

const routerA = express.Router();

routerA.post('/users', createUser);
routerA.put('/users/:role/:id', updateUser);
routerA.delete('/users/:role/:id', deleteUser);

routerA.post('/approve', approveUser);
routerA.post('/reports', generateReport);
routerA.post('/broadcast', broadcastNotification);
routerA.post('/broadcast-message', broadcastMessage);

routerA.post('/', createAdmin);
routerA.get('/', getAdmins);
routerA.get('/dashboard/:id', getAdminDashboard); 
routerA.get('/:id', getAdminById);
routerA.put('/:id', updateAdmin);
routerA.delete('/:id', deleteAdmin);

export default routerA;