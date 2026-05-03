import api from './api';

export const doctorService = {
  getDashboard: (id) => api.get(`/doctors/${id}/dashboard`),
  
  addPrescription: (id, payload) => 
    api.post(`/doctors/${id}/prescription`, payload),
  updatePrescription: (id, prescriptionId, payload) =>
    api.put(`/doctors/${id}/prescription/${prescriptionId}`, payload),
  deletePrescription: (id, prescriptionId) =>
    api.delete(`/doctors/${id}/prescription/${prescriptionId}`),

  addPatient: (payload) => api.post('/patients', payload),
  updatePatient: (id, payload) => api.put(`/patients/${id}`, payload),
  deletePatient: (id) => api.delete(`/patients/${id}`),
  addVitals: (patientId, payload) => api.post(`/patients/${patientId}/vitals`, payload),
  addAppointment: (id, payload) => api.post(`/doctors/${id}/appointments`, payload),
  deleteAppointment: (id, appointmentId) => api.delete(`/doctors/${id}/appointments/${appointmentId}`),
};
