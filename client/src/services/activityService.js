import api from './api';

export const activityService = {
    getPatientActivities: (patientID) => api.get(`/activities/patient/${patientID}`),
    getLoggerActivities: (loggerID) => api.get(`/activities/logger/${loggerID}`),
    createActivity: (activityData) => api.post('/activities', activityData),
};
