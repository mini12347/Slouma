import api from './api';

export const patientService = {
  getDashboard: (id) => api.get(`/patients/${id}`),
  
  takeMedicine: (id, medicineId, medicineName) => 
    api.post(`/patients/${id}/medicine`, { medicineId, medicineName }),
    
  addVitals: (id, vitals) => 
    api.post(`/patients/${id}/vitals`, vitals),

  addEmergencyContact: (id, contact) =>
    api.post(`/patients/${id}/emergency-contacts`, contact),

  deleteEmergencyContact: (id, contactId) =>
    api.delete(`/patients/${id}/emergency-contacts/${contactId}`),

  getTasks: (id) => api.get(`/patients/${id}/tasks`),
};
