import React, { useState, useEffect } from 'react';
import {
  Activity, Bell, Calendar, FileText, Heart, Menu, Pill, Users, LogOut, Droplet,
  TrendingUp, TrendingDown, CheckCircle, Clock, AlertTriangle, Phone, Video,
  ChevronRight, MoreVertical, Camera, MessageSquare, ShieldAlert, Globe, Settings, MapPin, Plus, XCircle, Loader2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import SettingsModal from '../../shared/SettingsModal';
import NotificationsPanel from '../../shared/NotificationsPanel';
import MessagesSection from '../../shared/MessagesSection';
import { translations } from '../../shared/translations';
import { caregiverService } from '../../services/caregiverService';
import { patientService } from '../../services/patientService';
import { activityService } from '../../services/activityService';
import api from '../../services/api';

const VitalsModal = ({ isOpen, onClose, onSave, patientName }) => {
  const [vitals, setVitals] = useState({
    heartRate: '',
    bloodPressure: '',
    weight: '',
    temperature: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white">
        <div className="px-8 py-6 bg-teal-700 text-white flex justify-between items-center">
          <h3 className="text-xl font-black">Record Vitals for {patientName}</h3>
          <button onClick={onClose}><XCircle className="w-6 h-6" /></button>
        </div>
        <div className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Heart Rate (bpm)</label>
            <input type="number" value={vitals.heartRate} onChange={e => setVitals({...vitals, heartRate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="e.g. 72" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Blood Pressure (mmHg)</label>
            <input type="text" value={vitals.bloodPressure} onChange={e => setVitals({...vitals, bloodPressure: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="e.g. 120/80" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Weight (kg)</label>
            <input type="number" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="e.g. 65" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Temperature (°C)</label>
            <input type="number" step="0.1" value={vitals.temperature} onChange={e => setVitals({...vitals, temperature: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="e.g. 36.6" />
          </div>
          <button onClick={() => onSave(vitals)} className="w-full py-4 bg-teal-700 text-white font-black rounded-xl hover:bg-teal-800 transition-all mt-4">
            Save Vitals
          </button>
        </div>
      </div>
    </div>
  );
};

const VisitModal = ({ isOpen, onClose, onSave, patients, doctors }) => {
  const [visit, setVisit] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white">
        <div className="px-8 py-6 bg-indigo-600 text-white flex justify-between items-center">
          <h3 className="text-xl font-black">Planifier une visite</h3>
          <button onClick={onClose}><XCircle className="w-6 h-6" /></button>
        </div>
        <div className="p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Patient</label>
              <select value={visit.patientId} onChange={e => setVisit({...visit, patientId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                <option value="">Sélectionner un patient</option>
                {patients.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.name} {p.lastname}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Médecin</label>
              <select value={visit.doctorId} onChange={e => setVisit({...visit, doctorId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                <option value="">Sélectionner un médecin</option>
                {doctors.map(d => <option key={d.id || d._id} value={d.id || d._id}>Dr. {d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</label>
              <input type="date" value={visit.date} onChange={e => setVisit({...visit, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Heure</label>
              <input type="time" value={visit.time} onChange={e => setVisit({...visit, time: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Motif</label>
            <textarea value={visit.reason} onChange={e => setVisit({...visit, reason: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold resize-none" rows="3" placeholder="Ex: Contrôle de routine"></textarea>
          </div>
          <button onClick={() => onSave(visit)} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all mt-4">
            Planifier la visite
          </button>
        </div>
      </div>
    </div>
  );
};

const EmergencyContactsModal = ({ isOpen, onClose, contacts, patientName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white">
        <div className="px-8 py-6 bg-rose-600 text-white flex justify-between items-center">
          <h3 className="text-xl font-black">Contacts d'urgence - {patientName}</h3>
          <button onClick={onClose}><XCircle className="w-6 h-6" /></button>
        </div>
        <div className="p-8 space-y-4">
          {!contacts || contacts.length === 0 ? (
            <p className="text-center text-slate-500 font-bold py-4">Aucun contact d'urgence trouvé.</p>
          ) : (
            contacts.map((contact, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h4 className="font-black text-slate-800">{contact.name}</h4>
                  <p className="text-sm font-bold text-slate-500">{contact.relationship}</p>
                </div>
                <a href={`tel:${contact.phone}`} className="p-3 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-colors shadow-sm">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            ))
          )}
          <button onClick={onClose} className="w-full py-4 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-900 transition-all mt-4">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CaregiverInterface({ patient: caregiverData, onLogout, language, setLanguage, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [caregiver, setCaregiver] = useState(caregiverData);
  const [tasks, setTasks] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);

  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const { data } = await caregiverService.getDashboard(caregiverData._id || caregiverData.id);
      setCaregiver(data.caregiver);
      
      setPatientsList(data.patients || []);
      setDoctorsList(data.doctors || []);
      setAppointmentsList(data.appointments || []);
      setActivitiesList(data.activities || []);
      setNotificationsList(data.notifications || []);
      
      const mappedTasks = (data.caregiver.tasks || []).map(t => ({
        ...t,
        id: t._id,
        time: new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        type: t.type || 'medication'
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error("Error fetching caregiver dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [caregiverData]);

  const toggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await caregiverService.updateTaskStatus(caregiver._id || caregiver.id, taskId, newStatus);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleRecordVitals = async (vitals) => {
    try {
      const patientId = selectedPatientId || (patientsList[0]?.id || patientsList[0]?._id);
      
      if (!patientId || patientId.toString().startsWith('mock')) {
        alert("Impossible d'ajouter des constantes vitales pour un patient de démonstration.");
        setShowVitalsModal(false);
        return;
      }

      await patientService.addVitals(patientId, vitals);
      await activityService.createActivity({
        patientID: patientId,
        loggedBy: caregiver._id || caregiver.id,
        role: 'caregiver',
        type: 'Vitals',
        title: 'Vitals Recorded',
        description: `Recorded vitals: HR ${vitals.heartRate}, BP ${vitals.bloodPressure}, Temp ${vitals.temperature}°C, Weight ${vitals.weight}kg`
      });
      setShowVitalsModal(false);
      alert("Constantes vitales enregistrées avec succès !");
      fetchDashboardData();
    } catch (error) {
      console.error("Error saving vitals:", error);
      alert("Erreur lors de l'enregistrement: " + (error.response?.data?.message || error.message));
    }
  };

  const handleMarkGiven = async (taskId, patientId, medName) => {
    try {
      await toggleTask(taskId, 'pending');
      await patientService.takeMedicine(patientId, medName, medName);
      await activityService.createActivity({
        patientID: patientId,
        loggedBy: caregiver._id || caregiver.id,
        role: 'caregiver',
        type: 'Medication',
        title: 'Medication Administered',
        description: `Administered medication: ${medName}`
      });
    } catch (error) {
      console.error("Error marking medicine as given:", error);
    }
  };

  const handleSOS = async () => {
    setShowSOSModal(true);
    try {
      const patientId = selectedPatientId || (patientsList[0]?.id || patientsList[0]?._id);
      if (!patientId) return;
      
      await activityService.createActivity({
        patientID: patientId,
        loggedBy: caregiver._id || caregiver.id,
        role: 'caregiver',
        type: 'Emergency',
        title: 'SOS ALARM',
        description: `SOS ALARM TRIGGERED BY CAREGIVER`
      });
    } catch (error) {
      console.error("Error logging SOS:", error);
    }
  };

  const handleScheduleVisit = async (visitData) => {
    if (!visitData.doctorId || !visitData.patientId || !visitData.date || !visitData.time) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    
    try {
      const doctor = doctorsList.find(d => (d.id || d._id) === visitData.doctorId);
      const patient = patientsList.find(p => (p.id || p._id) === visitData.patientId);
      
      const payload = {
        patientId: visitData.patientId,
        patientName: patient?.name + " " + (patient?.lastname || ""),
        date: visitData.date,
        time: visitData.time,
        type: visitData.reason || "Visite de soin",
        duration: "30 min"
      };

      if (!visitData.doctorId.startsWith('mock')) {
        await api.post(`/doctors/${visitData.doctorId}/appointments`, payload);
      } else {
        setAppointmentsList([...appointmentsList, {
          date: visitData.date,
          time: visitData.time,
          doctorName: doctor?.name || "Dr. Mansour",
          reason: visitData.reason
        }]);
      }
      
      await activityService.createActivity({
        patientID: visitData.patientId,
        loggedBy: caregiver._id || caregiver.id,
        role: 'caregiver',
        type: 'Appointment',
        title: 'Visite planifiée',
        description: `Visite planifiée avec Dr. ${doctor?.name || 'Inconnu'} pour le ${visitData.date} à ${visitData.time}`
      });

      setShowVisitModal(false);
      alert("Visite planifiée avec succès !");
      fetchDashboardData();
    } catch (error) {
      console.error("Error scheduling visit:", error);
      alert("Erreur lors de la planification de la visite");
    }
  };

  const isRtl = language === 'tn' || language === 'ar';
  const tr = translations[language] || translations.fr;
  const tg = tr.caregiver;
  const tc = tr.common;

  const getTaskIcon = (type) => {
    switch(type) {
      case 'medication': return <Pill className="w-6 h-6 text-teal-700 drop-shadow-sm" />;
      case 'vitals': return <Heart className="w-6 h-6 text-indigo-500 drop-shadow-sm" />;
      case 'meal': return <Droplet className="w-6 h-6 text-amber-500 drop-shadow-sm" />;
      case 'activity': return <Activity className="w-6 h-6 text-teal-700 drop-shadow-sm" />;
      default: return <CheckCircle className="w-6 h-6 text-slate-400 drop-shadow-sm" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-sm">{tc.loading}</p>
        </div>
      </div>
    );
  }

  const activePatient = patientsList[0] || { name: 'No Patient Assigned', lastname: '', age: '-', bloodGroup: '-', currentConditions: [] };

  const CaregiverOverview = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 rounded-3xl p-7 shadow-lg shadow-teal-600/20 relative overflow-hidden flex flex-col justify-center text-white">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight mb-2">{tg.hello} {caregiver.name}</h2>
            <p className="text-teal-100 mb-6 font-medium text-base">{tg.patientSummary}</p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => { setSelectedPatientId(activePatient.id || activePatient._id); setShowVitalsModal(true); }}
                className="px-6 py-3 bg-white text-teal-800 font-bold rounded-xl hover:bg-teal-50 transition-colors flex items-center gap-2 shadow-md"
              >
                <CheckCircle className="w-5 h-5" />
                {tg.recordStatus}
              </button>
              <button 
                onClick={() => setActiveTab('messages')}
                className="px-6 py-3 bg-white/15 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Video className="w-5 h-5" />
                {tg.callDoctor}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:w-80 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-white drop-shadow-md" />
          </div>
          <h3 className="font-black text-2xl mb-2">{tg.emergencyAction}</h3>
          <p className="text-indigo-100 text-sm font-semibold mb-6">{tg.emergencyHint}</p>
          <button 
            onClick={handleSOS}
            className="w-full py-4 bg-white text-indigo-600 font-black rounded-xl shadow-md hover:bg-indigo-50 transition-all text-lg"
          >
            {tg.sosCall}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{tg.taskList}</h3>
              <p className="text-teal-700 font-bold text-base mt-1">
                {tasks.filter(t => t.status === 'completed').length} {tg.of} {tasks.length} {tg.tasksCompleted}
              </p>
            </div>
            {tasks.length > 0 && (
              <div className="text-lg font-black text-teal-800 bg-teal-50 px-5 py-2 rounded-xl border border-teal-100 shadow-sm">
                {Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%
              </div>
            )}
          </div>

          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No tasks assigned for today</p>
              </div>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`group flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    task.status === 'completed' 
                      ? 'border-teal-100 bg-teal-50/50 opacity-80' 
                      : 'border-slate-100 hover:border-teal-300 bg-white shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => toggleTask(task.id, task.status)}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-sm ${
                      task.status === 'completed' ? 'bg-teal-100 border-teal-200 text-teal-700' : 'bg-slate-50 border-slate-100'
                    }`}>
                      {task.status === 'completed' ? <CheckCircle className="w-7 h-7" /> : getTaskIcon(task.type)}
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold transition-colors ${task.status === 'completed' ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-500">{task.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${
                    task.status === 'completed' ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300 bg-white group-hover:border-teal-400'
                  }`}>
                    {task.status === 'completed' && <CheckCircle className="w-5 h-5" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-b from-teal-50 to-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-teal-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-32 bg-teal-200/30 blur-3xl"></div>
            <div className="w-28 h-28 mx-auto bg-gradient-to-tr from-teal-600 to-teal-700 p-1.5 rounded-full mb-5 shadow-lg relative z-10">
              <img src={activePatient.image || "https://i.pravatar.cc/150?u=patient"} alt="Patient" className="w-full h-full rounded-full object-cover border-4 border-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{activePatient.name} {activePatient.lastname}</h3>
            <p className="text-teal-700 font-bold text-base mt-1 mb-6">{activePatient.id}</p>
            
            <div className="grid grid-cols-2 gap-4 text-left border-t border-teal-100/50 pt-6 mt-2 relative z-10">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{tg.age}</p>
                <p className="font-black text-slate-800 text-lg">
                  {activePatient.dateOfBirth ? new Date().getFullYear() - new Date(activePatient.dateOfBirth).getFullYear() : '-'} {tc.years}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{tg.group}</p>
                <p className="font-black text-indigo-600 text-lg">{activePatient.bloodGroup || 'O+'}</p>
              </div>
              <div className="col-span-2 bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
                <p className="text-xs font-bold text-amber-600 mb-1 uppercase tracking-wider">{tg.conditionsLabel}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(activePatient.currentConditions || []).length > 0 ? (
                    activePatient.currentConditions.map((c, i) => (
                      <span key={i} className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-bold text-slate-400 italic">No conditions recorded</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
            <h3 className="font-black text-xl text-slate-800 tracking-tight mb-5">{tg.quickContacts}</h3>
            <div className="space-y-4">
              {doctorsList.length > 0 ? (
                doctorsList.map(doc => (
                  <button key={doc.id || doc._id} className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <Heart className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-base group-hover:text-indigo-700 transition-colors">Dr. {doc.name}</p>
                        <p className="text-sm font-semibold text-slate-500">{doc.specialization || 'Médecin'}</p>
                      </div>
                    </div>
                    <Phone className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </button>
                ))
              ) : (
                <p className="text-center text-slate-400 py-4 font-bold italic">No doctors linked</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 mt-6">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-4">
          <Activity className="w-8 h-8 text-indigo-600" />
          {language === 'fr' ? "Journal d'Activité" : "Activity Log"}
        </h3>
        <div className="space-y-6">
          {activitiesList.length === 0 ? (
            <p className="text-slate-400 italic text-center py-8">No recent activities</p>
          ) : (
            activitiesList.map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  item.type === 'Emergency' ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600'
                }`}>
                  {item.type === 'Emergency' ? <AlertTriangle className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                </div>
                <div className="flex-1 pb-4 border-b border-slate-50 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-black text-slate-800">
                      {item.title || item.type}: {item.description}
                    </h4>
                    <span className="text-xs font-bold text-slate-400">{new Date(item.date || item.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-500">{item.patientID}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const CaregiverVitals = () => {
    const latestVitals = activePatient.vitalSigns?.[activePatient.vitalSigns.length - 1] || {};
    return (
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
        <h2 className="text-3xl font-black text-slate-800 mb-8">{tg.vitalHistory} - {activePatient.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-8 rounded-3xl shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden">
            <Heart className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10" />
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="font-bold text-indigo-100 text-lg">{tg.heartRate}</h3>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><Heart className="w-7 h-7 text-white" /></div>
            </div>
            <p className="text-5xl font-black relative z-10 tracking-tight">{latestVitals.heartRate || '--'} <span className="text-xl font-bold text-indigo-200">bpm</span></p>
          </div>
          <div className="bg-gradient-to-br from-teal-700 to-teal-600 p-8 rounded-3xl shadow-lg shadow-teal-700/20 text-white relative overflow-hidden">
            <Activity className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10" />
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="font-bold text-teal-100 text-lg">{tg.bloodPressure}</h3>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><Activity className="w-7 h-7 text-white" /></div>
            </div>
            <p className="text-5xl font-black relative z-10 tracking-tight">{latestVitals.bloodPressure || '--/--'}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-3xl shadow-lg shadow-amber-500/20 text-white relative overflow-hidden">
            <TrendingDown className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10" />
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="font-bold text-amber-100 text-lg">{tg.weight}</h3>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><TrendingDown className="w-7 h-7 text-white" /></div>
            </div>
            <p className="text-5xl font-black relative z-10 tracking-tight">{latestVitals.weight || '--'} <span className="text-xl font-bold text-amber-200">kg</span></p>
          </div>
        </div>
        <div className="border-2 border-dashed border-teal-200 rounded-3xl p-8 bg-teal-50/50 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
             <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-teal-950 mb-2">{language === 'fr' ? "Nouvelle mesure" : "New Measurement"}</h3>
          <p className="font-semibold text-teal-800/70 mb-6 max-w-md">{language === 'fr' ? "Enregistrez une nouvelle mesure pour le patient." : "Record a new measurement for the patient."}</p>
          <button 
            onClick={() => { setSelectedPatientId(activePatient.id || activePatient._id); setShowVitalsModal(true); }}
            className="bg-teal-700 text-white font-black py-4 px-8 rounded-xl hover:bg-teal-800 transition-colors shadow-lg shadow-teal-700/20 text-lg"
          >
            {tg.record || 'Record'}
          </button>
        </div>
      </div>
    );
  };

  const CaregiverMedicines = () => (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-slate-800">{tg.medTracking}</h2>
        <span className="bg-teal-50 text-teal-800 font-black text-base px-6 py-2.5 rounded-xl border border-teal-200 shadow-sm">{tc.today}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.filter(t => t.type === 'medication').length === 0 ? (
          <p className="col-span-2 text-center text-slate-400 font-bold py-8">No medications scheduled today</p>
        ) : (
          tasks.filter(t => t.type === 'medication').map(med => (
            <div key={med.id} className="border-2 border-slate-100 bg-white p-6 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:border-teal-200">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-700 shadow-inner shrink-0">
                  <Pill className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg">{med.title}</h4>
                  <p className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-4 h-4"/> {tc.today}: {med.time}</p>
                </div>
              </div>
              {med.status === 'completed' ? (
                 <span className="text-emerald-500 font-black text-base flex flex-col items-center gap-1 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                   <CheckCircle className="w-6 h-6"/> {tg.given}
                 </span>
              ) : (
                 <button 
                  onClick={() => handleMarkGiven(med.id, activePatient.id || activePatient._id, med.title)}
                  className="bg-teal-700 border border-teal-600 text-white font-black px-6 py-3.5 rounded-xl hover:bg-teal-800 transition-all shadow-md shadow-teal-700/20"
                 >
                    {tg.markGiven}
                 </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const CaregiverAppointments = () => (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
      <h2 className="text-3xl font-black text-slate-800 mb-8">{tg.appointments}</h2>
      <div className="space-y-5">
        {appointmentsList.length === 0 ? (
          <p className="text-center text-slate-400 font-bold py-8">No upcoming appointments</p>
        ) : (
          appointmentsList.map((appt, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-6 rounded-3xl border-2 border-slate-100 bg-white hover:border-teal-300 hover:shadow-lg transition-all shadow-sm">
              <div className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-700 to-teal-600 rounded-2xl text-white shadow-md">
                <span className="text-sm font-bold uppercase opacity-90">{new Date(appt.date).toLocaleDateString([], { month: 'short' })}</span>
                <span className="text-2xl font-black">{new Date(appt.date).getDate()}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-xl">{appt.doctorName || `Dr. ${appt.doctorID}`}</h4>
                <p className="text-base font-bold text-teal-700 mt-1">{appt.reason}</p>
              </div>
              <div className="font-black text-slate-600 bg-slate-50 px-5 py-3 rounded-xl border border-slate-200 flex items-center gap-2 text-base">
                <Clock className="w-5 h-5" /> {appt.time}
              </div>
            </div>
          ))
        )}
      </div>
      <button 
        onClick={() => setShowVisitModal(true)}
        className="mt-8 w-full py-5 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 font-black text-white rounded-2xl transition-all shadow-lg shadow-teal-700/20 text-lg"
      >
        {tg.scheduleVisit}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 transition-opacity" onClick={() => setShowSidebar(false)}/>
      )}

      {/* Sidebar */}
      <aside className={`fixed ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} top-0 bottom-0 w-72 bg-white border-slate-200 z-50 sidebar-transition flex flex-col shadow-xl ${
        showSidebar ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
      }`}>
        <div className="h-24 flex items-center px-8 border-b border-slate-100 shrink-0 relative">
          <Heart className="w-10 h-10 text-indigo-500 drop-shadow-md shrink-0" />
          <div className="ms-4 flex-1 min-w-0">
            <span className="font-black text-xl text-slate-800 tracking-tight leading-none block truncate">
              Slouma <span className="text-indigo-600 font-medium">{tg.overview}</span>
            </span>
          </div>
          <button 
            onClick={() => setShowSidebar(false)}
            className="absolute top-4 end-4 p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-xl font-black shadow-md">
              {caregiver.name?.charAt(0)}{caregiver.lastname?.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-black text-slate-800 leading-none">{caregiver.name} {caregiver.lastname}</h3>
              <p className="text-sm font-bold text-teal-700 mt-1.5">{tg.leadCaregiver}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', icon: Activity, label: tg.overview },
            { id: 'vitals', icon: Heart, label: tg.vitals },
            { id: 'prescriptions', icon: FileText, label: language === 'fr' ? 'Ordonnances' : language === 'ar' || language === 'tn' ? 'وصفات طبية' : 'Prescriptions' },
            { id: 'appointments', icon: Calendar, label: tg.appointments },
            { id: 'messages', icon: MessageSquare, label: tc.messages },

          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setShowSidebar(false); }}
                className={`w-full flex items-center px-5 py-4 text-base font-bold rounded-2xl transition-all gap-4
                  ${isActive ? 'bg-teal-700 text-white shadow-lg shadow-teal-700/20' : 'text-slate-500 hover:bg-slate-100 hover:text-teal-700'}`}
              >
                <tab.icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:scale-110 transition-transform'}`} />
                <span className="flex-1 text-start truncate">{tab.label}</span>
                {isActive && (
                  <div className="w-1.5 h-6 bg-white rounded-full shrink-0"></div>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-6 border-t border-slate-100 space-y-3 shrink-0 bg-slate-50/50">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-center px-4 py-3.5 text-sm font-black text-slate-600 bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 rounded-xl transition-all shadow-sm group gap-3"
          >
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-teal-600 shrink-0" />
            <span className="flex-1 text-start truncate">{tc.settings}</span>
          </button>
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center px-4 py-3.5 text-sm font-black text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 rounded-xl transition-all shadow-sm group gap-3"
          >
            <LogOut className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform shrink-0" />
            <span className="flex-1 text-start truncate">{tc.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 lg:${isRtl ? (showSidebar ? 'mr-72' : 'mr-0') : (showSidebar ? 'ml-72' : 'ml-0')} flex flex-col min-h-screen`}>
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 sm:px-10">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setShowSidebar(!showSidebar)} 
              className="p-3 -ms-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 shadow-sm sm:shadow-none"
            >
              <Menu className="w-8 h-8" />
            </button>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
              {{
                overview: tg.overview,
                vitals: tg.vitals,
                prescriptions: language === 'fr' ? 'Ordonnances' : language === 'ar' || language === 'tn' ? 'وصفات طبية' : 'Prescriptions',
                appointments: tg.appointments,
                messages: tc.messages,

              }[activeTab]}
            </h2>
          </div>
          <div className="flex items-center gap-6">
          <div className="relative hidden sm:block">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200"
              >
                <Globe className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-bold text-slate-700">
                  {tc.langLabel?.[language]}
                </span>
              </button>
              {showLanguageMenu && (
                <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 min-w-[180px] origin-top-right z-[100]">
                  {tc.langOptions.map((l) => (
                    <button key={l.code} onClick={() => { setLanguage(l.code); setShowLanguageMenu(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                        language === l.code ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}>
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-3 bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl shadow-sm transition-all"
            >
              <Bell className="w-6 h-6 flex-shrink-0" />
              {notificationsList.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-sm"></span>
              )}
            </button>
            <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
            <div className="hidden sm:block text-right">
              <p className="text-base font-black text-slate-800">{caregiver.name}</p>
              <p className="text-sm font-bold text-teal-700 mt-0.5">{tg.leadCaregiver}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 sm:p-10">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && <CaregiverOverview />}
            {activeTab === 'vitals' && <CaregiverVitals />}
            {activeTab === 'prescriptions' && (
              <div className="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
                <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-4">
                   <FileText className="w-10 h-10 text-teal-600" />
                   {language === 'fr' ? "Ordonnances de l'Ami" : "Patient Prescriptions"}
                </h2>
                <div className="space-y-6">
                  {(activePatient.prescriptions?.length > 0 ? activePatient.prescriptions : [
                    {
                      doctorID: "DOC-DR001",
                      date: new Date(Date.now() - 86400000 * 2),
                      status: "Active",
                      medications: [
                        { name: "Amoxicilline", dosage: "500mg", frequency: "3 fois par jour" }
                      ]
                    },
                    {
                      doctorID: "DOC-DR002",
                      date: new Date(Date.now() - 86400000 * 15),
                      status: "Completed",
                      medications: [
                        { name: "Ibuprofène", dosage: "400mg", frequency: "2 fois par jour" }
                      ]
                    }
                  ]).map((presc, idx) => (
                    <div key={idx} className="p-6 border-2 border-slate-100 rounded-2xl bg-slate-50 hover:border-teal-300 transition-all">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="font-black text-slate-900 text-lg">Dr. {presc.doctorID}</p>
                          <p className="text-sm font-bold text-slate-500">{new Date(presc.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black border-2 ${presc.status === 'Active' ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                          {presc.status}
                        </span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                        {presc.medications.map((med, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                              <Pill className="w-4 h-4 text-teal-600" />
                            </div>
                            <p className="text-sm font-bold text-slate-700">{med.name} - {med.dosage} ({med.frequency})</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'appointments' && <CaregiverAppointments />}

            {activeTab === 'messages' && (
              <MessagesSection 
                language={language} 
                userRole="caregiver"
                currentUser={{ ...caregiver, id: caregiver._id || caregiver.id, role: 'caregiver' }} 
              />
            )}
          </div>
        </div>
      </main>

      {!showSidebar && (
        <button 
          onClick={() => setShowSidebar(true)}
          className={`fixed top-1/2 -translate-y-1/2 z-40 bg-white p-3 shadow-xl border-y border-${isRtl ? 'l' : 'r'} border-slate-200 hover:bg-teal-50 hover:text-indigo-600 transition-all ${isRtl ? 'right-0 rounded-l-2xl' : 'left-0 rounded-r-2xl'}`}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        language={language}
        currentUser={{ ...caregiver, id: caregiver._id || caregiver.id, role: 'caregiver' }}
        onUpdate={onUpdateUser}
      />
      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
        language={language} 
        userId={caregiver?._id || caregiver?.id} 
        userRole="caregiver"
      />
      
      <VitalsModal 
        isOpen={showVitalsModal} 
        onClose={() => setShowVitalsModal(false)} 
        onSave={handleRecordVitals} 
        patientName={activePatient.name} 
      />

      <VisitModal 
        isOpen={showVisitModal} 
        onClose={() => setShowVisitModal(false)} 
        onSave={handleScheduleVisit}
        patients={patientsList}
        doctors={doctorsList}
      />

      <EmergencyContactsModal 
        isOpen={showSOSModal} 
        onClose={() => setShowSOSModal(false)} 
        contacts={activePatient?.emergencyContacts || []}
        patientName={activePatient?.name || 'Patient'}
      />
    </div>
  );
}
