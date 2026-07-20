import api from './api';

export const reportService = {
    getPatientReports: (patientID) => api.get(`/reports/patient/${patientID}`),
    getDoctorReports: (doctorID) => api.get(`/reports/doctor/${doctorID}`),
    createReport: (reportData) => api.post('/reports', reportData),
};
