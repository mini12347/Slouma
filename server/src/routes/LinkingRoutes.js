import express from 'express';
import { assignDoctorToPatient, assignCaregiverToPatient, linkDoctorAndCaregiver } from '../controllers/LinkingController.js';

const router = express.Router();

router.post('/assign-doctor', assignDoctorToPatient);
router.post('/assign-caregiver', assignCaregiverToPatient);
router.post('/link-doctor-caregiver', linkDoctorAndCaregiver);

export default router;
