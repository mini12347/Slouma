import express from 'express';
import { getPatients, getPatientById, createPatient, updatePatient, deletePatient, takeMedicine, addVitals, addEmergencyContact, deleteEmergencyContact, getPatientTasks } from '../controllers/patientController.js';

const routerP = express.Router();

routerP.get('/', getPatients);
routerP.get('/:id', getPatientById);
routerP.post('/', createPatient);
routerP.put('/:id', updatePatient);
routerP.delete('/:id', deletePatient);
routerP.post('/:id/medicine', takeMedicine);
routerP.post('/:id/vitals', addVitals);
routerP.post('/:id/emergency-contacts', addEmergencyContact);
routerP.delete('/:id/emergency-contacts/:contactId', deleteEmergencyContact);
routerP.get('/:id/tasks', getPatientTasks);

export default routerP;
