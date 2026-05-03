import api from './api';

export const linkingService = {
    assignDoctor: (patientID, doctorID) => api.post('/links/assign-doctor', { patientID, doctorID }),
    assignCaregiver: (patientID, caregiverID) => api.post('/links/assign-caregiver', { patientID, caregiverID }),
    linkDoctorCaregiver: (doctorID, caregiverID) => api.post('/links/link-doctor-caregiver', { doctorID, caregiverID }),
};
