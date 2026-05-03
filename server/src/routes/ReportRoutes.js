import express from 'express';
import { getPatientReports, createReport, getDoctorReports } from '../controllers/ReportController.js';

const router = express.Router();

router.get('/patient/:patientID', getPatientReports);
router.get('/doctor/:doctorID', getDoctorReports);
router.post('/', createReport);

export default router;
