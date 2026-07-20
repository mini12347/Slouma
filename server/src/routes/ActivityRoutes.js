import express from 'express';
import { getPatientActivities, createActivity, getActivitiesByLogger } from '../controllers/ActivityController.js';

const router = express.Router();

router.get('/patient/:patientID', getPatientActivities);
router.get('/logger/:loggerID', getActivitiesByLogger);
router.post('/', createActivity);

export default router;
