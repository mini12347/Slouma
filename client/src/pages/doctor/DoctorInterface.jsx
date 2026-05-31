import React, { useState } from 'react';
import {
  Activity, Bell, FileText, Heart, Menu, Users, Stethoscope, TrendingUp, CheckCircle, Info, Droplet, Pill, LogOut,
  MessageCircle, Search, Filter, MoreVertical, Calendar, Clock, Phone, Video, ChevronRight, UserPlus, Globe,
  Settings, PenTool, Plus, MessageSquare, XCircle
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import SettingsModal from '../../shared/SettingsModal';
import NotificationsPanel from '../../shared/NotificationsPanel';
import MessagesSection from '../../shared/MessagesSection';
import { doctorService } from '../../services/doctorService';
import { translations } from '../../shared/translations';
import jsPDF from "jspdf/dist/jspdf.es.min.js";



function StatCard({ icon: Icon, label, value, trend, colorClass, shadowClass }) {
  return (
    <div className={`rounded-3xl p-6 text-white relative overflow-hidden ${colorClass} ${shadowClass}`}>
      <Icon className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <span className="px-3 py-1 bg-white/20 border border-white/30 text-white rounded-xl text-xs font-bold leading-none flex items-center h-7 backdrop-blur-md">
          {trend}
        </span>
      </div>
      <p className="text-white/80 text-sm font-semibold relative z-10 uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-black text-white tracking-tight mt-1 relative z-10">{value}</h3>
    </div>
  );
}

function DoctorPatients({ language, patients, fetchDashboard, doctorId }) {
  const [search, setSearch] = useState('');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const isRtl = language === 'tn' || language === 'ar';

  const filteredPatients = (patients || []).filter(p => {
    const searchLower = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(searchLower) ||
      p.email?.toLowerCase().includes(searchLower) ||
      String(p.id || '').toLowerCase().includes(searchLower) ||
      (p.conditions && p.conditions.some(c => c.toLowerCase().includes(searchLower)))
    );
  });

  const handleAddPatient = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await doctorService.addPatient({
        name: formData.get('name'),
        lastname: formData.get('lastname') || 'Patient',
        email: formData.get('email'),
        phone: formData.get('phone') || '00000000',
        bloodGroup: formData.get('bloodGroup') || 'O+',
        dateOfBirth: formData.get('dateOfBirth') || new Date(),
        gender: formData.get('gender') === 'Homme' ? 'Male' : 'Female',
        currentConditions: formData.get('conditions').split(',').map(s=>s.trim()).filter(Boolean),
        role: 'Patient',
        doctorIDs: [doctorId],
        password: 'password123'
      });
      setShowAddPatientModal(false);
      fetchDashboard();
    } catch (err) { alert(err.message); }
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const targetId = editingPatient._id || editingPatient.id;
    if (!targetId) {
      alert("ID du patient manquant");
      return;
    }
    try {
      await doctorService.updatePatient(String(targetId), {
        name: formData.get('name'),
        lastname: formData.get('lastname'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender') === 'Homme' ? 'Male' : 'Female',
        bloodGroup: formData.get('bloodGroup'),
        address: formData.get('address'),
        currentConditions: formData.get('conditions').split(',').map(s=>s.trim()).filter(Boolean),
        healthStatus: formData.get('healthStatus')
      });
      setEditingPatient(null);
      fetchDashboard();
    } catch (err) { 
      console.error('Update failed:', err);
      alert(err.message); 
    }
  };

  const handleDeletePatient = async (p) => {
    const targetId = p._id || p.id;
    if (!targetId) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le patient ${p.name} ?`)) {
      try {
        await doctorService.deletePatient(String(targetId));
        fetchDashboard();
      } catch (err) { 
        console.error('Delete failed:', err);
        alert(err.message); 
      }
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Liste des patients
        </h2>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className={`w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'}`} />
            <input 
              type="text" 
              placeholder="Rechercher des patients"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-teal-600 outline-none transition-all shadow-sm font-semibold`}
            />
          </div>
          <button onClick={() => setShowAddPatientModal(true)} className="px-5 py-3.5 bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-700/20 font-bold rounded-2xl flex items-center gap-2 transition-all">
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">Ajouter un patient</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden p-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-5 font-black">Utilisateur</th>
                <th className="px-6 py-5 font-black">Conditions</th>
                <th className="px-6 py-5 font-black">Statut</th>
                <th className="px-6 py-5 font-black">Dernière visite</th>
                <th className="px-6 py-5 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-teal-50/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 font-black flex items-center justify-center shrink-0 shadow-sm">
                        {p.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-base">{p.name}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {p.dateOfBirth ? Math.floor((new Date() - new Date(p.dateOfBirth)) / 31557600000) : 'N/A'} {language === 'en' || language === 'fr' ? 'yrs' : 'سنة'} • {p.gender}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1">
                      {p.conditions?.map((c, i) => (
                        <span key={i} className="text-[10px] font-black uppercase tracking-tight bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black capitalize shadow-sm border
                      ${p.status === 'stable' ? 'bg-teal-50 text-teal-700 border-teal-200' : 
                        p.status === 'monitor' || p.status === 'surveillance' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                        'bg-rose-50 text-rose-600 border-rose-200'}`}>
                      {p.healthStatus || p.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-semibold">{p.lastVisit}</td>
                  <td className={`px-6 py-5 ${isRtl ? 'text-left' : 'text-right'}`}>
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setEditingPatient(p)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:text-teal-700 transition-colors"
                      >
                        Éditer
                      </button>
                      <button 
                        onClick={() => handleDeletePatient(p)}
                        className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-black rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddPatientModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800">Ajouter un patient</h3>
              <button onClick={() => setShowAddPatientModal(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                  <input type="text" name="name" placeholder="Prénom" required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                  <input type="text" name="lastname" placeholder="Nom de famille" required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" name="email" required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                  <input type="tel" name="phone" required pattern="^[0-9]{8}$" maxLength="8" title="Veuillez entrer un numéro de téléphone tunisien valide (8 chiffres)" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date de Naissance</label>
                  <input type="date" name="dateOfBirth" required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sexe</label>
                  <select name="gender" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800">
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Groupe Sanguin</label>
                  <select name="bloodGroup" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800">
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Conditions (séparées par virgule)</label>
                  <input type="text" name="conditions" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" placeholder="Ex: Diabète, Hypertension" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddPatientModal(false)} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors">
                  Annuler
                </button>
                <button type="submit" className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-lg shadow-teal-600/25 transition-all">
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingPatient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800">Éditer le patient</h3>
              <button onClick={() => setEditingPatient(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            <form onSubmit={handleEditPatient} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                  <input type="text" name="name" defaultValue={editingPatient.name?.split(' ')[0]} required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                  <input type="text" name="lastname" defaultValue={editingPatient.lastname || editingPatient.name?.split(' ')[1] || ''} required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" name="email" defaultValue={editingPatient.email} required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                  <input type="tel" name="phone" defaultValue={editingPatient.phone} required pattern="^[0-9]{8}$" maxLength="8" title="Veuillez entrer un numéro de téléphone tunisien valide (8 chiffres)" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date de Naissance</label>
                  <input type="date" name="dateOfBirth" defaultValue={editingPatient.dateOfBirth ? new Date(editingPatient.dateOfBirth).toISOString().split('T')[0] : ''} required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sexe</label>
                  <select name="gender" defaultValue={editingPatient.gender === 'Male' ? 'Homme' : 'Femme'} className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800">
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Groupe Sanguin</label>
                  <select name="bloodGroup" defaultValue={editingPatient.bloodGroup || 'O+'} className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800">
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Statut de santé</label>
                  <select name="healthStatus" defaultValue={editingPatient.healthStatus || editingPatient.status} className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800">
                    <option value="stable">Stable</option>
                    <option value="surveillance">Surveillance</option>
                    <option value="critique">Critique</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Adresse</label>
                  <input type="text" name="address" defaultValue={editingPatient.address} className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" placeholder="Ex: 123 Rue de la Liberté, Tunis" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Conditions (séparées par virgule)</label>
                  <input type="text" name="conditions" defaultValue={editingPatient.conditions?.join(', ')} className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" placeholder="Ex: Diabète, Hypertension" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setEditingPatient(null)} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors">
                  Annuler
                </button>
                <button type="submit" className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-lg shadow-teal-600/25 transition-all">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

  const DoctorDashboard = ({ language, patients, appointments, prescriptions, notifications, doctorId, fetchDashboard }) => {
    const isRtl = language === 'tn' || language === 'ar';
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showAddAppointment, setShowAddAppointment] = useState(false);

    const handleAddAppointment = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const dateStr = formData.get('date');
      const timeStr = formData.get('time');
      
      const appDate = new Date(dateStr);
      const now = new Date();
      const todayAtMidnight = new Date();
      todayAtMidnight.setHours(0, 0, 0, 0);

      if (appDate < todayAtMidnight) {
        alert(language === 'fr' ? "Impossible de prendre un rendez-vous dans le passé" : "Cannot book appointments in the past");
        return;
      }

      const [hours, minutes] = timeStr.split(':').map(Number);
      if (hours < 8 || (hours >= 21 && minutes > 0) || hours > 21) {
        alert(language === 'fr' ? "Les rendez-vous doivent être entre 08:00 et 21:00" : "Appointments must be between 08:00 and 21:00");
        return;
      }

      if (appDate.toDateString() === now.toDateString()) {
        const appTime = new Date();
        appTime.setHours(hours, minutes, 0, 0);
        if (appTime < now) {
          alert(language === 'fr' ? "Impossible de prendre un rendez-vous à une heure déjà passée aujourd'hui" : "Cannot book a time that has already passed today");
          return;
        }
      }

      const patId = formData.get('patientId');
      const pat = patients.find(p => 
        (p.id && String(p.id) === String(patId)) || 
        (p._id && String(p._id) === String(patId))
      );
      try {
        await doctorService.addAppointment(doctorId, {
          patientName: pat ? pat.name : 'Inconnu',
          patientId: patId,
          time: formData.get('time'),
          date: new Date(formData.get('date')),
          type: formData.get('type'),
          duration: formData.get('duration')
        });
        setShowAddAppointment(false);
        fetchDashboard();
      } catch (err) { alert(err.message); }
    };

    const handleDeleteAppointment = async (appId) => {
      if (window.confirm("Supprimer ce rendez-vous ?")) {
        try {
          await doctorService.deleteAppointment(doctorId, appId);
          fetchDashboard();
        } catch (err) { alert(err.message); }
      }
    };

    const handleVideoCall = (appointmentId) => {
      const roomName = `Slouma-Appt-${appointmentId}`;
      window.open(`https://meet.jit.si/${roomName}`, '_blank');
    };

    const generatePlanningPDF = () => {
      const doc = new jsPDF();
      const tr = translations[language] || translations.fr;
      const td = tr.doctor;
      
      doc.setFontSize(22);
      doc.setTextColor(20, 184, 166);
      doc.text("Planning des Rendez-vous", 105, 20, { align: "center" });
      
      doc.setDrawColor(20, 184, 166);
      doc.line(20, 25, 190, 25);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
      doc.text(`Médecin: Dr. Mohamed Ahmed`, 20, 42);
      
      doc.line(20, 48, 190, 48);
      
      let y = 60;
      appointments.forEach((appt, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text(`${appt.time} - ${appt.patient}`, 20, y);
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Type: ${appt.type} | Durée: ${appt.duration}`, 20, y + 7);
        y += 20;
      });
      
      doc.save(`Planning_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total des patients" value={patients.length.toString()} trend="Actifs" colorClass="bg-gradient-to-br from-teal-700 to-teal-600" shadowClass="shadow-lg shadow-teal-700/25" />
        <StatCard icon={Calendar} label="Rendez-vous" value={appointments.length.toString()} trend="Planifiés" colorClass="bg-gradient-to-br from-teal-600 to-teal-500" shadowClass="shadow-lg shadow-teal-600/25" />
        <StatCard icon={FileText} label="Ordonnances" value={prescriptions.length.toString()} trend="Actives" colorClass="bg-gradient-to-br from-teal-800 to-teal-700" shadowClass="shadow-lg shadow-teal-800/25" />
        <StatCard icon={Activity} label="Cas critiques" value={patients.filter(p => p.status === 'critical' || p.status === 'critique').length.toString()} trend="Urgent" colorClass="bg-gradient-to-br from-rose-500 to-red-600" shadowClass="shadow-lg shadow-rose-500/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              Tendances hebdomadaires
            </h3>
            <select className="bg-slate-50 border border-slate-200 text-teal-800 text-sm font-black rounded-xl px-4 py-2.5 outline-none focus:border-teal-600 hover:bg-teal-50 transition-colors shadow-sm">
              <option>Cette semaine</option>
              <option>La semaine dernière</option>
              <option>Ce mois-ci</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
                { name: 'Lun', visits: 40, online: 24 },
                { name: 'Mar', visits: 30, online: 13 },
                { name: 'Mer', visits: 20, online: 48 },
                { name: 'Jeu', visits: 27, online: 39 },
                { name: 'Ven', visits: 18, online: 48 },
                { name: 'Sam', visits: 23, online: 38 },
                { name: 'Dim', visits: 34, online: 43 },
              ]}>
              <defs>
                <linearGradient id="colorVisitsDoctor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOnlineDoctor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.24}/>
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} dx={-10} />
              <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
              <Area type="monotone" dataKey="visits" stroke="#14b8a6" strokeWidth={4} fillOpacity={1} fill="url(#colorVisitsDoctor)" />
              <Area type="monotone" dataKey="online" stroke="#2dd4bf" strokeWidth={4} fillOpacity={1} fill="url(#colorOnlineDoctor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Schedule Sidebar */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              RDV aujourd'hui
            </h3>
            <div className="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm">
              {appointments.length} rendez-vous
            </div>
          </div>
          
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-sm">Aucun RDV aujourd'hui</p>
              </div>
            ) : (
              appointments.map(appt => (
                <div key={appt.id} className="p-5 rounded-2xl bg-white border-2 border-slate-100 hover:border-teal-300 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-black text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">{appt.time}</span>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {appt.duration}</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-800 mb-1 leading-tight">{appt.patient}</h4>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <p className="text-sm text-slate-500 font-bold">{appt.type}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleVideoCall(appt.id)}
                        className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 hover:bg-teal-600 hover:text-white hover:shadow-lg shadow-teal-600/25 transition-all"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center mt-6 gap-2">
            <button onClick={generatePlanningPDF} className="flex-1 py-4 bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-800 font-black rounded-xl transition-colors border border-slate-200 hover:border-teal-200 shadow-sm text-sm uppercase tracking-wider">
              Voir le planning
            </button>
            <button onClick={() => setShowAddAppointment(true)} className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl transition-colors shadow-lg shadow-teal-600/25 text-sm uppercase tracking-wider">
              + Ajouter RDV
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 mt-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-4">
          <Activity className="w-8 h-8 text-teal-600" />
          Journal d'Activité Récent
        </h3>
        <div className="space-y-6">
          {[
            ...appointments.map(a => ({ ...a, activityType: 'appointment', date: new Date() })),
            ...prescriptions.map(p => ({ ...p, activityType: 'prescription', date: new Date(p.date) })),
            ...notifications.map(n => ({ ...n, activityType: 'notification', date: new Date(n.date) }))
          ].sort((a, b) => b.date - a.date).slice(0, 10).map((item, idx) => (
            <div key={idx} className="flex gap-6 items-start group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                item.activityType === 'appointment' ? 'bg-indigo-50 text-indigo-600' :
                item.activityType === 'prescription' ? 'bg-teal-50 text-teal-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                {item.activityType === 'appointment' ? <Calendar className="w-6 h-6" /> :
                 item.activityType === 'prescription' ? <Pill className="w-6 h-6" /> :
                 <Bell className="w-6 h-6" />}
              </div>
              <div className="flex-1 pb-4 border-b border-slate-50 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-slate-800">
                    {item.activityType === 'appointment' ? `RDV: ${item.patient}` :
                     item.activityType === 'prescription' ? `Ordonnance: ${item.patient}` :
                     `Notification: ${item.content || item.message}`}
                  </h4>
                  <span className="text-xs font-bold text-slate-400">{new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-sm font-bold text-slate-500">
                  {item.activityType === 'appointment' ? item.type :
                   item.activityType === 'prescription' ? item.drug :
                   item.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Patients Panel */}
      {patients.filter(p => p.status === 'critical' || p.status === 'critique').length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(239,68,68,0.08)]">
          <h3 className="text-xl font-black text-rose-800 tracking-tight mb-6 flex items-center gap-3">
            <Activity className="w-6 h-6 text-rose-600 animate-pulse" />
            Patients en état critique
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.filter(p => p.status === 'critical' || p.status === 'critique').map((p, i) => (
              <div key={i} className="bg-white border-2 border-rose-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 font-black text-lg flex items-center justify-center shrink-0 border border-rose-200">
                  {p.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-slate-800 truncate">{p.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(p.conditions || []).slice(0, 2).map((c, ci) => (
                      <span key={ci} className="text-[10px] font-black uppercase bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded">{c}</span>
                    ))}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-600 text-white shrink-0">Critique</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800">Planning Complet</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {appointments.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Aucun rendez-vous prévu.</p>
              ) : (
                appointments.map(appt => (
                  <div key={appt.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-black text-teal-800">{appt.time} - {appt.duration}</p>
                      <p className="font-bold text-slate-800 text-lg">{appt.patient}</p>
                      <p className="text-xs font-bold text-slate-500">{appt.type}</p>
                    </div>
                    <button onClick={() => handleDeleteAppointment(appt.id)} className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-black rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors">
                      Annuler
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showAddAppointment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800">Nouveau Rendez-vous</h3>
              <button onClick={() => setShowAddAppointment(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            <form onSubmit={handleAddAppointment} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Patient</label>
                <select name="patientId" required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800">
                  <option value="">Sélectionner un patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input type="date" name="date" required min={new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Heure (08:00 - 21:00)</label>
                  <input type="time" name="time" required min="08:00" max="21:00" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Type de RDV</label>
                  <input type="text" name="type" placeholder="ex: Consultation" required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Durée (ex: 30 min)</label>
                  <input type="text" name="duration" placeholder="ex: 30 min" required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddAppointment(false)} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors">
                  Annuler
                </button>
                <button type="submit" className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-lg shadow-teal-600/25 transition-all">
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function DoctorSidebar({ activeTab, setActiveTab, onLogout, language, showSidebar, setShowSidebar, onLanguageToggle, setShowSettings }) {
  const tr = (translations[language] || translations.fr);
  const td = tr.doctor;
  const tc = tr.common;
  const tabs = [
    { id: 'dashboard', icon: Activity, label: td.dashboard },
    { id: 'patients', icon: Users, label: td.patients },
    { id: 'vitals', icon: Heart, label: td.vitals },
    { id: 'tasks', icon: CheckCircle, label: td.tasks || 'Tâches' },
    { id: 'prescriptions', icon: Pill, label: td.prescriptions },
    { id: 'analytics', icon: TrendingUp, label: td.analytics },
    { id: 'messages', icon: MessageCircle, label: tc.messages },
  ];
  const isRtl = language === 'en' || language === 'fr' ? false : true;

  return (
      <aside
      className={`fixed ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} top-0 bottom-0 bg-white border-slate-200 shadow-[20px_0_40px_rgba(0,0,0,0.05)] z-50 sidebar-transition w-80 flex flex-col ${
        showSidebar ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
      }`}
    >
      <div className="p-8 pb-4 shrink-0 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-4 mb-8 relative">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-700 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg shadow-teal-700/25 shrink-0">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none truncate">Slouma <span className="text-teal-700 font-medium">Santé</span></h1>
            <p className="text-xs text-teal-700 font-bold uppercase tracking-widest mt-1 truncate">{td.healthProvider}</p>
          </div>
          <button 
            onClick={() => setShowSidebar(false)}
            className="absolute -top-2 -end-2 p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-50 rounded-xl transition-all lg:hidden"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=dr" alt="Doctor" className="w-12 h-12 rounded-xl border-2 border-teal-100 object-cover" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-600 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-black text-slate-800 text-sm">{language === 'tn' || language === 'ar' ? 'د. محمد أحمد' : 'Dr. Mohamed Ahmed'}</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-bold">{td.cardiologist}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowSidebar(false); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
                ${isActive ? 'bg-teal-700 shadow-lg shadow-teal-700/20 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-teal-700'}`}
            >
              <tab.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'}`} />
              <span className="font-bold tracking-wide text-base flex-1 text-start truncate">{tab.label}</span>
              {isActive && (
                <div className="w-1.5 h-6 bg-white rounded-full shrink-0"></div>
              )}
            </button>
          )
        })}
      </nav>

      <div className="p-6 mt-auto space-y-3 shrink-0 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => setShowSettings(true)}
          className="w-full px-4 py-3.5 bg-white border border-slate-200 hover:border-teal-200 hover:bg-teal-50 text-slate-600 hover:text-teal-800 rounded-xl font-bold text-sm transition-all flex items-center gap-3 shadow-sm group"
        >
          <Settings className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
          <span className="flex-1 text-start truncate">{tc.settings}</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full px-4 py-3.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 text-rose-600 rounded-xl font-bold text-sm transition-all flex items-center gap-3 shadow-sm group"
        >
          <LogOut className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
          <span className="flex-1 text-start truncate">{tc.logout}</span>
        </button>
      </div>
    </aside>
  );
}

export default function DoctorInterface({ patient, onLogout, language, setLanguage, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const tr = translations[language] || translations.fr;
  const td = tr.doctor;
  const tc = tr.common;
  const isRtl = language === 'en' || language === 'fr' ? false : true;
  const [patientsList, setPatientsList] = React.useState([]);
  const [appointmentsList, setAppointmentsList] = React.useState([]);
  const [prescriptionsList, setPrescriptionsList] = React.useState([]);
  const [notificationsList, setNotificationsList] = React.useState([]);
  const [tasksList, setTasksList] = React.useState([]);

  React.useEffect(() => {
    if (patient) fetchDashboard();
  }, [patient]);

  const fetchDashboard = async () => {
    try {
      const data = await doctorService.getDashboard(patient._id || patient.id);
      const mappedPatients = data.patients.map((p, i) => ({
        _id: p._id,
        id: p.id || p._id || i,
        name: p.name + ' ' + (p.lastname || ''),
        lastname: p.lastname || '',
        email: p.email || '',
        phone: p.phone || '',
        address: p.address || '',
        bloodGroup: p.bloodGroup || 'O+',
        dateOfBirth: p.dateOfBirth || null,
        age: p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : 30,
        gender: p.gender === 'male' ? 'Homme' : p.gender === 'Male' ? 'Homme' : 'Femme',
        status: p.healthStatus || 'stable',
        accountStatus: p.status || 'active',
        conditions: p.currentConditions || [],
        lastVisit: 'Récent',
        avatar: (p.name || 'U').substring(0,2).toUpperCase(),
        vitalSigns: p.vitalSigns || []
      }));
      const mappedPrescriptions = (data.doctor.prescriptions || []).map((p, i) => {
         const pat = mappedPatients.find(mp => 
           (mp.id && String(mp.id) === String(p.patientID)) || 
           (mp._id && String(mp._id) === String(p.patientID))
         );
         return {
           id: p._id || i,
           patientId: p.patientID,
           patient: pat ? pat.name : 'Inconnu',
           drug: p.medications[0]?.name || 'Inconnu',
           dosage: p.medications[0]?.dosage || '',
           frequency: p.medications[0]?.frequency || '',
           date: new Date(p.date).toLocaleDateString(),
           status: p.status || 'Actif'
         }
      });

      const mappedAppointments = (data.doctor.appointments || []).map(a => {
        let pName = a.patientName;
        if (!pName || pName === 'Inconnu') {
          const pat = mappedPatients.find(mp => 
            (mp.id && String(mp.id) === String(a.patientId)) || 
            (mp._id && String(mp._id) === String(a.patientId))
          );
          if (pat) pName = pat.name;
        }
        return {
          id: a._id || a.id,
          time: a.time,
          patient: pName || 'Inconnu',
          type: a.type,
          duration: a.duration
        };
      });

      setPatientsList(mappedPatients);
      setPrescriptionsList(mappedPrescriptions);
      setAppointmentsList(mappedAppointments);
      setTasksList(data.tasks || []);
      if (data.notifications) setNotificationsList(data.notifications);
    } catch (err) {
      console.error('Failed to fetch doctor dashboard', err);
    }
  };

  const handleLanguageToggle = () => {
    const langs = ['en', 'fr', 'ar', 'tn'];
    const nextLang = langs[(langs.indexOf(language) + 1) % langs.length];
    setLanguage(nextLang);
  };


  const DoctorVitals = () => {
    const [viewingJournalFor, setViewingJournalFor] = useState(null);
    const [showAddVitalsModal, setShowAddVitalsModal] = useState(null);

    const handleAddVitals = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const targetId = showAddVitalsModal._id || showAddVitalsModal.id;
      try {
        await doctorService.addVitals(String(targetId), {
          heartRate: Number(formData.get('heartRate')) || undefined,
          bloodPressure: formData.get('bloodPressure'),
          temperature: Number(formData.get('temperature')) || undefined,
          weight: Number(formData.get('weight')) || undefined
        });
        setShowAddVitalsModal(null);
        fetchDashboard();
      } catch (err) { alert(err.message); }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Suivi des constantes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patientsList.map(p => {
            const latestVitals = p.vitalSigns && p.vitalSigns.length > 0 ? p.vitalSigns[p.vitalSigns.length - 1] : {};
            return (
              <div key={p.id} className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-sm hover:border-teal-300 hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-center font-black text-teal-800 text-lg shadow-inner">{p.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 text-lg truncate">{p.name}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.conditions?.slice(0, 2).map((c, i) => (
                          <span key={i} className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{c}</span>
                        ))}
                        {p.conditions?.length > 2 && <span className="text-[9px] font-black text-slate-400">+{p.conditions.length - 2}</span>}
                      </div>
                    </div>
                  </div>
                  <Activity className={`w-8 h-8 ${p.status === 'critical' ? 'text-rose-500' : 'text-emerald-500'}`} />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-slate-400 mb-1 uppercase tracking-wider">Poids</p>
                    <p className="text-2xl font-black text-slate-800">{latestVitals.weight || '--'} <span className="text-sm text-slate-400 font-bold">kg</span></p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-slate-400 mb-1 uppercase tracking-wider">Tension</p>
                    <p className="text-2xl font-black text-slate-800">{latestVitals.bloodPressure || '--'}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button onClick={() => setViewingJournalFor(p)} className="flex-1 py-3 bg-teal-50 text-teal-800 font-bold rounded-xl border border-teal-100 hover:bg-teal-700 hover:text-white transition-colors text-sm">
                    Journal
                  </button>
                  <button onClick={() => setShowAddVitalsModal(p)} className="flex-1 py-3 bg-white text-teal-700 font-bold rounded-xl border border-teal-200 hover:bg-teal-50 transition-colors text-sm">
                    + Ajouter
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {viewingJournalFor && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 my-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800">Journal de {viewingJournalFor.name}</h3>
                <button onClick={() => setViewingJournalFor(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {(!viewingJournalFor.vitalSigns || viewingJournalFor.vitalSigns.length === 0) ? (
                  <p className="text-slate-500 text-center py-8">Aucun enregistrement trouvé.</p>
                ) : (
                  viewingJournalFor.vitalSigns.map((vs, idx) => (
                    <div key={idx} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex flex-wrap gap-6 justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-slate-400">{new Date(vs.date).toLocaleString()}</p>
                        <div className="flex gap-4 mt-2">
                          {vs.heartRate && <span className="font-bold text-slate-700">Rythme: <span className="text-teal-600">{vs.heartRate} bpm</span></span>}
                          {vs.bloodPressure && <span className="font-bold text-slate-700">Tension: <span className="text-teal-600">{vs.bloodPressure}</span></span>}
                          {vs.temperature && <span className="font-bold text-slate-700">Temp: <span className="text-teal-600">{vs.temperature}°C</span></span>}
                          {vs.weight && <span className="font-bold text-slate-700">Poids: <span className="text-teal-600">{vs.weight} kg</span></span>}
                        </div>
                      </div>
                    </div>
                  )).reverse()
                )}
              </div>
            </div>
          </div>
        )}

        {showAddVitalsModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-slate-100 my-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800">Ajouter constantes pour {showAddVitalsModal.name}</h3>
                <button onClick={() => setShowAddVitalsModal(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>
              <form onSubmit={handleAddVitals} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Rythme Cardiaque (bpm)</label>
                    <input type="text" name="heartRate" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tension (ex: 120/80)</label>
                    <input type="text" name="bloodPressure" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Température (°C)</label>
                    <input type="text" name="temperature" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Poids (kg)</label>
                    <input type="text" name="weight" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setShowAddVitalsModal(null)} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors">
                    Annuler
                  </button>
                  <button type="submit" className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-lg shadow-teal-600/25 transition-all">
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const DoctorPrescriptions = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPrescription, setEditingPrescription] = useState(null);
    const handleAddPrescription = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      try {
        await doctorService.addPrescription(patient._id || patient.id, {
          patientId: formData.get('patientId'),
          medications: [{ name: formData.get('drugName'), dosage: formData.get('dosage'), frequency: formData.get('frequency') }]
        });
        setShowAddModal(false);
        fetchDashboard();
      } catch (err) { alert(err.message); }
    };

    const handleUpdatePrescription = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      try {
        await doctorService.updatePrescription(patient._id || patient.id, editingPrescription.id, {
          status: formData.get('status'),
          medications: [{ 
            name: formData.get('drugName'), 
            dosage: formData.get('dosage'), 
            frequency: formData.get('frequency') 
          }]
        });
        setEditingPrescription(null);
        fetchDashboard();
      } catch (err) { alert(err.message); }
    };

    const handleDeletePrescription = async (prescId) => {
      if (!window.confirm('Supprimer cette ordonnance ?')) return;
      try {
        await doctorService.deletePrescription(patient._id || patient.id, prescId);
        fetchDashboard();
      } catch (err) { alert(err.message); }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ordonnances</h2>
          <button onClick={() => setShowAddModal(true)} className="bg-teal-700 text-white px-6 py-3 font-black rounded-xl flex items-center gap-2 shadow-lg shadow-teal-700/25 hover:bg-teal-800 transition-colors">
            <PenTool className="w-5 h-5" /> Nouvelle ordonnance
          </button>
        </div>
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 rounded-2xl">
              <tr>
                <th className="px-6 py-5 font-black text-xs uppercase tracking-wider text-slate-500 rounded-tl-2xl rounded-bl-2xl">Patient</th>
                <th className="px-6 py-5 font-black text-xs uppercase tracking-wider text-slate-500">Médicament</th>
                <th className="px-6 py-5 font-black text-xs uppercase tracking-wider text-slate-500">Date de prescription</th>
                <th className="px-6 py-5 font-black text-xs uppercase tracking-wider text-slate-500 text-right rounded-tr-2xl rounded-br-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescriptionsList.map(pres => (
                <tr key={pres.id} className="hover:bg-teal-50/40 transition-colors">
                  <td className="px-6 py-6 font-bold text-slate-800">{pres.patient}</td>
                  <td className="px-6 py-6 font-black text-teal-700 flex items-center gap-2"><Pill className="w-5 h-5"/> {pres.drug}</td>
                  <td className="px-6 py-6 text-sm font-bold text-slate-500">{pres.date}</td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setEditingPrescription(pres)}
                        className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-700 transition-colors"
                      >
                        Réviser
                      </button>
                      <button 
                        onClick={() => handleDeletePrescription(pres.id)}
                        className="px-4 py-2 bg-rose-50 border border-rose-100 shadow-sm rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-slate-100 my-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800">Ajouter une ordonnance</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>
              <form onSubmit={handleAddPrescription} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Patient</label>
                  <select name="patientId" required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800">
                    <option value="">Sélectionner un patient</option>
                    {patientsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Médicament</label>
                  <input type="text" name="drugName" required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</label>
                    <input type="text" name="dosage" placeholder="ex: 500mg" required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fréquence</label>
                    <input type="text" name="frequency" placeholder="ex: 2x/jour" required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors">
                    Annuler
                  </button>
                  <button type="submit" className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-lg shadow-teal-600/25 transition-all">
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {editingPrescription && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-slate-100 my-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800">Réviser l'ordonnance</h3>
                <button onClick={() => setEditingPrescription(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>
              <form onSubmit={handleUpdatePrescription} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Patient</label>
                  <input type="text" value={editingPrescription.patient} disabled className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-bold text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Médicament</label>
                  <input type="text" name="drugName" defaultValue={editingPrescription.drug} required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</label>
                    <input type="text" name="dosage" defaultValue={editingPrescription.dosage || '500mg'} required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fréquence</label>
                    <input type="text" name="frequency" defaultValue={editingPrescription.frequency || '2x/jour'} required className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 rounded-2xl outline-none transition-all font-bold text-slate-800" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setEditingPrescription(null)} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors">
                    Annuler
                  </button>
                  <button type="submit" className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-lg shadow-teal-600/25 transition-all">
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const DoctorAnalytics = () => {
    const totalPatients = patientsList.length;
    const totalPrescriptions = prescriptionsList.length;
    const totalAppointments = appointmentsList.length;
    const criticalCount = patientsList.filter(p => p.status === 'critique' || p.status === 'critical').length;
    const stableCount = patientsList.filter(p => p.status === 'stable').length;
    const monitorCount = patientsList.filter(p => p.status === 'surveillance' || p.status === 'monitor').length;

    const conditionMap = {};
    patientsList.forEach(p => (p.conditions || []).forEach(c => {
      conditionMap[c] = (conditionMap[c] || 0) + 1;
    }));
    const conditionData = Object.entries(conditionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    if (conditionData.length === 0) conditionData.push({ name: 'Aucune donnée', count: 0 });

    const healthData = [
      { name: 'Stable', value: stableCount, fill: '#14b8a6' },
      { name: 'Surveillance', value: monitorCount, fill: '#f59e0b' },
      { name: 'Critique', value: criticalCount, fill: '#ef4444' },
    ].filter(d => d.value > 0);
    if (healthData.length === 0) healthData.push({ name: 'Aucun patient', value: 0, fill: '#e2e8f0' });

    const apptTypeMap = {};
    appointmentsList.forEach(a => {
      const t = a.type || 'Autre';
      apptTypeMap[t] = (apptTypeMap[t] || 0) + 1;
    });
    const apptData = Object.entries(apptTypeMap).map(([name, count]) => ({ name, count }));
    if (apptData.length === 0) apptData.push({ name: 'Aucun RDV', count: 0 });

    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Analytique</h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Patients', value: totalPatients, color: 'teal' },
            { label: 'Ordonnances', value: totalPrescriptions, color: 'indigo' },
            { label: 'Rendez-vous', value: totalAppointments, color: 'amber' },
            { label: 'Cas critiques', value: criticalCount, color: 'rose' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-white rounded-3xl p-6 border-2 border-${color}-100 shadow-sm`}>
              <p className={`text-xs font-black text-${color}-500 uppercase tracking-widest mb-2`}>{label}</p>
              <p className={`text-4xl font-black text-${color}-700`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Conditions les plus fréquentes */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
            <h3 className="font-black text-slate-800 mb-8 text-xl">Conditions les plus fréquentes</h3>
            {conditionData.every(d => d.count === 0) ? (
              <p className="text-slate-400 text-center py-12">Aucune condition enregistrée</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={conditionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9"/>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fontWeight:700, fill:'#94a3b8'}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontWeight:700, fill:'#64748b'}} width={110} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius:'16px', fontWeight:'bold', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0/0.1)'}}/>
                  <Bar dataKey="count" fill="#14b8a6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* État de santé des patients */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
            <h3 className="font-black text-slate-800 mb-8 text-xl">État de santé des patients</h3>
            {totalPatients === 0 ? (
              <p className="text-slate-400 text-center py-12">Aucun patient assigné</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={healthData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                      {healthData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius:'16px', fontWeight:'bold', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0/0.1)'}}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  {healthData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.fill}} />
                      <span className="text-sm font-bold text-slate-600">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Types de rendez-vous */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
            <h3 className="font-black text-slate-800 mb-8 text-xl">Types de rendez-vous</h3>
            {apptData.every(d => d.count === 0) ? (
              <p className="text-slate-400 text-center py-12">Aucun rendez-vous planifié</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={apptData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontWeight:700, fill:'#94a3b8'}} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fontWeight:700, fill:'#94a3b8'}} dx={-10}/>
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius:'16px', fontWeight:'bold', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0/0.1)'}}/>
                  <Bar dataKey="count" fill="#6366f1" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Résumé ordonnances */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
            <h3 className="font-black text-slate-800 mb-6 text-xl">Résumé des ordonnances</h3>
            {prescriptionsList.length === 0 ? (
              <p className="text-slate-400 text-center py-12">Aucune ordonnance</p>
            ) : (
              <div className="space-y-4">
                {prescriptionsList.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-black text-slate-800 text-sm">{p.patient}</p>
                      <p className="text-xs font-bold text-teal-700 mt-0.5">{p.drug} {p.dosage && `· ${p.dosage}`}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-black border ${
                      p.status === 'Actif' || p.status === 'Active'
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>{p.status}</span>
                  </div>
                ))}
                {prescriptionsList.length > 5 && (
                  <p className="text-xs text-slate-400 text-center font-bold">+{prescriptionsList.length - 5} ordonnances supplémentaires</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DoctorMessages = () => (
    <MessagesSection 
      language={language} 
      userRole="doctor" 
      currentUser={{ id: patient?._id || patient?.id, name: patient?.name || 'Doctor', role: 'doctor' }} 
    />
  );

  const DoctorTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTasks = tasksList.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= today && taskDate <= new Date(today.getTime() + 24 * 60 * 60 * 1000);
    });

    const getTaskIcon = (type) => {
      switch(type) {
        case 'medication': return <Pill className="w-6 h-6 text-teal-700" />;
        case 'vitals': return <Heart className="w-6 h-6 text-indigo-500" />;
        case 'meal': return <Droplet className="w-6 h-6 text-amber-500" />;
        case 'activity': return <Activity className="w-6 h-6 text-teal-700" />;
        default: return <CheckCircle className="w-6 h-6 text-slate-400" />;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tâches du jour</h2>
          <div className="bg-teal-50 text-teal-800 border border-teal-200 px-5 py-2.5 rounded-xl font-black text-sm shadow-sm">
            {todayTasks.length} tâches aujourd'hui
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Liste des tâches</h3>
                <p className="text-teal-700 font-bold text-base mt-1">
                  {todayTasks.filter(t => t.status === 'completed').length} de {todayTasks.length} complétées
                </p>
              </div>
              {todayTasks.length > 0 && (
                <div className="text-lg font-black text-teal-800 bg-teal-50 px-5 py-2 rounded-xl border border-teal-100 shadow-sm">
                  {Math.round((todayTasks.filter(t => t.status === 'completed').length / todayTasks.length) * 100)}%
                </div>
              )}
            </div>

            <div className="space-y-4">
              {todayTasks.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-400 font-bold">Aucune tâche pour aujourd'hui</p>
                </div>
              ) : (
                todayTasks.map(task => (
                  <div 
                    key={task._id || task.id} 
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                      task.status === 'completed' 
                        ? 'border-teal-100 bg-teal-50/50 opacity-80' 
                        : 'border-slate-100 hover:border-teal-300 bg-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-sm ${
                        task.status === 'completed' ? 'bg-teal-100 border-teal-200 text-teal-700' : 'bg-slate-50 border-slate-100'
                      }`}>
                        {task.status === 'completed' ? <CheckCircle className="w-7 h-7" /> : getTaskIcon(task.type)}
                      </div>
                      <div>
                        <h4 className={`text-lg font-bold ${task.status === 'completed' ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800'}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-500">
                            {new Date(task.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          <span className="text-sm font-bold text-slate-400">•</span>
                          <span className="text-sm font-bold text-slate-500">{task.patientName}</span>
                          <span className="text-sm font-bold text-slate-400">•</span>
                          <span className="text-sm font-bold text-indigo-600">{task.caregiverName}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black border shadow-sm ${
                      task.status === 'completed' 
                        ? 'bg-teal-100 text-teal-700 border-teal-200' 
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {task.status === 'completed' ? 'Complété' : 'En attente'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-600 to-teal-500 rounded-3xl p-8 shadow-lg shadow-teal-600/20 text-white">
              <h3 className="text-xl font-black mb-4">Résumé du jour</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-teal-100 font-semibold">Total tâches</span>
                  <span className="text-2xl font-black">{todayTasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-teal-100 font-semibold">Complétées</span>
                  <span className="text-2xl font-black">{todayTasks.filter(t => t.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-teal-100 font-semibold">En attente</span>
                  <span className="text-2xl font-black">{todayTasks.filter(t => t.status !== 'completed').length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
              <h3 className="font-black text-xl text-slate-800 tracking-tight mb-5">Tâches par patient</h3>
              <div className="space-y-3">
                {Array.from(new Set(todayTasks.map(t => t.patientName))).map(patientName => {
                  const patientTasks = todayTasks.filter(t => t.patientName === patientName);
                  const completed = patientTasks.filter(t => t.status === 'completed').length;
                  return (
                    <div key={patientName} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 font-black">
                          {patientName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800">{patientName}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-black text-teal-700">{completed}</span>
                        <span className="text-slate-400">/</span>
                        <span className="font-bold text-slate-600">{patientTasks.length}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100" dir={isRtl ? 'rtl' : 'ltr'}>
      <DoctorSidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} 
        language={language} showSidebar={showSidebar} setShowSidebar={setShowSidebar}
        onLanguageToggle={handleLanguageToggle} setShowSettings={setShowSettings}
      />

      <main className={`flex-1 main-content-transition lg:${isRtl ? (showSidebar ? 'mr-80' : 'mr-0') : (showSidebar ? 'ml-80' : 'ml-0')} min-h-screen flex flex-col`}>
        <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 sm:px-10 py-5">
            <div className="flex items-center gap-5">
              <button onClick={() => setShowSidebar(!showSidebar)} className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight capitalize hidden sm:block">
                {{
                  dashboard: td?.dashboard,
                  patients: td?.patients,
                  vitals: td?.vitals,
                  tasks: td?.tasks || 'Tâches',
                  prescriptions: td?.prescriptions,
                  analytics: td?.analytics,
                  messages: tc?.messages
                }[activeTab]}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200"
                >
                  <Globe className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-bold text-slate-700">{tc?.langLabel?.[language]}</span>
                </button>
                {showLanguageMenu && (
                  <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 min-w-[180px] origin-top-right">
                    {(tc?.langOptions || [{code:'tn',name:'Tunisien'},{code:'ar',name:'Arabe'},{code:'fr',name:'Français'},{code:'en',name:'Anglais'}]).map((l) => (
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
              <div className="hidden md:flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 px-5 py-2.5 rounded-xl font-black text-sm shadow-sm">
                <Heart className="w-5 h-5" /> 2 {td?.criticalAlerts}
              </div>
              <button 
                onClick={() => setShowNotifications(true)}
                className="relative p-3 bg-slate-50 border border-slate-200 text-slate-500 hover:text-teal-700 hover:border-teal-200 hover:bg-teal-50 rounded-xl shadow-sm transition-all"
              >
                <Bell className="w-6 h-6 flex-shrink-0" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 border-2 border-white rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DoctorDashboard 
                language={language} 
                patients={patientsList} 
                appointments={appointmentsList}
                prescriptions={prescriptionsList}
                notifications={notificationsList}
                doctorId={patient?._id || patient?.id}
                fetchDashboard={fetchDashboard}
              />
            )}
            {activeTab === 'patients' && (
              <DoctorPatients 
                language={language} 
                patients={patientsList}
                fetchDashboard={fetchDashboard}
                doctorId={patient?._id || patient?.id}
              />
            )}
            {activeTab === 'vitals' && <DoctorVitals />}
            {activeTab === 'tasks' && <DoctorTasks />}
            {activeTab === 'prescriptions' && <DoctorPrescriptions />}
            {activeTab === 'analytics' && <DoctorAnalytics />}
            {activeTab === 'messages' && <DoctorMessages />}
          </div>
        </div>
      </main>

      {/* Floating Toggle Button when sidebar is closed */}
      {!showSidebar && (
        <button 
          onClick={() => setShowSidebar(true)}
          className={`fixed top-1/2 -translate-y-1/2 z-40 bg-white p-3 shadow-xl border-y border-${isRtl ? 'l' : 'r'} border-slate-200 text-slate-600 hover:bg-slate-100 transition-all ${isRtl ? 'right-0 rounded-l-2xl' : 'left-0 rounded-r-2xl'}`}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {showSidebar && <div className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40" onClick={() => setShowSidebar(false)} />}
      
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        language={language}
        setLanguage={setLanguage}
        currentUser={patient}
        onUpdate={onUpdateUser}
      />
      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
        language={language}
        userId={patient?._id || patient?.id}
        userRole="doctor"
      />
    </div>
  );
}
