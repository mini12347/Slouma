import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf/dist/jspdf.es.min.js';
import 'jspdf-autotable';
import { 
  Heart, LogOut, Phone, Users, Bot, AlertTriangle, Activity,
  Droplets, Thermometer, Pill, CheckCircle2, CalendarDays,
  ChevronRight, Clock, Menu, Home, FileText, Settings, Bell,
  Globe, Download, Search, PlusCircle, Volume2, Video, XCircle, MessageCircle
} from 'lucide-react';
import EmergencyModal from '../../shared/EmergencyModal';
import VoiceAssistantModal from '../../shared/VoiceAssistantModal';
import SettingsModal from '../../shared/SettingsModal';
import NotificationsPanel from '../../shared/NotificationsPanel';
import MessagesSection from '../../shared/MessagesSection';
import { patientService } from '../../services/patientService';
import { translations } from '../../shared/translations';

export default function PatientInterface({ patient, onLogout, language, setLanguage, onUpdateUser }) {
  const [showEmergency, setShowEmergency] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '' });

  const tr = translations[language] || translations.fr;
  const tp = tr.patient;
  const tc = tr.common;
  const isRtl = language === 'ar' || language === 'tn';

  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    if (patient && patient.medications) {
      const todayLogs = (patient.medicalHistory || []).filter(h => 
        new Date(h.date).toDateString() === new Date().toDateString() && h.notes?.includes('Medicine taken:')
      );
      
      let meds = patient.medications.map((med, index) => {
        const isTaken = todayLogs.some(log => log.notes.includes(med.name || med._id));
        return {
          id: med._id || index,
          name: med.name,
          time: med.frequency || '08:00 AM',
          taken: isTaken,
          stock: med.dosage || 'N/A'
        };
      });

      if (meds.length === 0) {
        meds = [
          { id: 'mock1', name: 'Paracétamol 500mg', time: '08:00 AM', taken: false, stock: '10' },
          { id: 'mock2', name: 'Vitamines C', time: '12:00 PM', taken: false, stock: '20' }
        ];
      }
      setMedicines(meds);
    }
  }, [patient]);

  const handleTakeMedicine = async (id) => {
    const med = medicines.find(m => m.id === id);
    if (!med) return;
    
    setMedicines(medicines.map((m) => m.id === id ? { ...m, taken: true } : m));
    
    try {
      await patientService.takeMedicine(patient._id || patient.id, med.id, med.name);
    } catch (err) {
      console.error('Failed to log medicine:', err);
      setMedicines(medicines.map((m) => m.id === id ? { ...m, taken: false } : m));
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    setIsSubmitting(true);
    try {
      const response = await patientService.addEmergencyContact(patient._id || patient.id, newContact);
      onUpdateUser(response);
      setNewContact({ name: '', relationship: '', phone: '' });
      setIsAddingContact(false);
      alert(tr.common?.success || 'Contact ajouté avec succès !');
    } catch (err) {
      console.error('Failed to add contact:', err);
      alert(tr.common?.error || 'Échec de l\'ajout du contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm(tr.common?.confirmDelete || 'Are you sure you want to delete this contact?')) return;
    try {
      const response = await patientService.deleteEmergencyContact(patient._id || patient.id, contactId);
      onUpdateUser(response);
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  const ActionCard = ({ icon: Icon, title, onClick, bgColor, textColor, iconBg }) => (
    <button
      onClick={onClick}
      className={`${bgColor} border-b-4 border-black/10 rounded-3xl p-6 transition-transform active:scale-95 flex flex-col items-center justify-center text-center w-full shadow-lg`}
    >
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner ${iconBg}`}>
        <Icon className={`w-10 h-10 ${textColor}`} />
      </div>
      <h3 className={`text-2xl font-black tracking-tight leading-tight ${textColor}`}>{title}</h3>
    </button>
  );

    const PatientOverview = () => {
    const latestVitals = patient.vitalSigns?.[patient.vitalSigns.length - 1] || {
      heartRate: 72,
      bloodPressure: '120/80',
    };

    const nextAppointment = patient.appointments?.sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;

    const handleVideoCall = (appointmentId) => {
      const roomName = `Slouma-Appt-${appointmentId}`;
      window.open(`https://meet.jit.si/${roomName}`, '_blank');
    };

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section 1: Upcoming Appointments */}
          <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-[3rem] p-8 shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <CalendarDays className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black">{tp.appointments}</h2>
                </div>

                {nextAppointment ? (
                  <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/20 mb-8">
                    <p className="text-teal-200 font-black text-sm uppercase tracking-widest mb-2">PROCHAIN RDV</p>
                    <h3 className="text-4xl font-black mb-1">{nextAppointment.doctorID}</h3>
                    <p className="text-xl font-bold text-teal-100 mb-6">{nextAppointment.reason}</p>
                    <div className="flex items-center gap-4 bg-white/20 py-4 px-6 rounded-2xl w-fit border border-white/10 font-black text-2xl">
                      <Clock className="w-8 h-8" />
                      {new Date(nextAppointment.date).toLocaleDateString()} - {nextAppointment.time}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center bg-white/5 rounded-[2rem] border-4 border-dashed border-white/10 mb-8">
                    <p className="text-2xl font-bold text-teal-100/50">Pas de rendez-vous prévu</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleVideoCall(nextAppointment?._id || nextAppointment?.id || 'Consultation')}
                className="w-full bg-white text-teal-900 hover:bg-teal-50 font-black text-2xl py-6 rounded-3xl shadow-xl active:scale-95 transition-all flex justify-center items-center gap-3"
              >
                <Video className="w-8 h-8"/> {tc.join || 'Rejoindre la consultation'}
              </button>
            </div>
          </div>

          {/* Section 2: Today's Medication Checklist */}
          <div className="bg-white rounded-[3rem] p-8 shadow-xl border-4 border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b-4 border-slate-50 pb-6">
              <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                <Pill className="w-12 h-12 text-teal-700" />
                {tp.todayMeds || "Dose du jour"}
              </h2>
              <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-2xl font-black text-lg">
                {medicines.filter(m => m.taken).length}/{medicines.length}
              </span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {medicines.length > 0 ? medicines.map((med) => (
                <div 
                  key={med.id}
                  className={`p-6 rounded-[2rem] border-4 transition-all flex items-center justify-between
                    ${med.taken 
                      ? 'bg-slate-50 border-slate-100 opacity-60' 
                      : 'bg-teal-50/50 border-teal-100 shadow-sm'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-4
                      ${med.taken ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-teal-600 border-teal-700 text-white shadow-inner'}`}>
                      {med.taken ? <CheckCircle2 className="w-8 h-8" /> : <Pill className="w-8 h-8" />}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black ${med.taken ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                        {med.name}
                      </h3>
                      <p className={`text-lg font-bold flex items-center gap-2 ${med.taken ? 'text-slate-400' : 'text-teal-700'}`}>
                        <Clock className="w-5 h-5" /> {med.time}
                      </p>
                    </div>
                  </div>

                  {!med.taken && (
                    <button
                      onClick={() => handleTakeMedicine(med.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                      <CheckCircle2 className="w-8 h-8" />
                    </button>
                  )}
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Pill className="w-20 h-20 mb-4 opacity-20" />
                  <p className="text-xl font-bold">Pas de médicaments pour aujourd'hui</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Section 3: Voice Assistant Card */}
          <div className="lg:col-span-1">
            <button
              onClick={() => setShowVoiceAssistant(true)}
              className="w-full h-full bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-8 shadow-2xl text-white relative overflow-hidden group text-center flex flex-col items-center justify-center gap-6 border-b-[12px] border-blue-900 active:translate-y-2 active:border-b-4 transition-all"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] group-hover:scale-150 transition-transform duration-1000" />
              <div className="w-32 h-32 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-inner relative">
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
                <Bot className="w-16 h-16" />
              </div>
              <div>
                <h3 className="text-4xl font-black mb-2">{tp.voiceAssistant}</h3>
                <p className="text-indigo-100 text-xl font-bold opacity-80 uppercase tracking-widest">Assistant Intelligent</p>
              </div>
            </button>
          </div>

          {/* Section 4: Emergency Contacts & Health Vitals */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-red-50 border-4 border-red-100 rounded-[3rem] p-8 shadow-xl">
              <h2 className="text-3xl font-black text-red-900 mb-8 flex items-center gap-4">
                <Phone className="w-10 h-10 text-red-600" />
                {tp.emergencyContacts || "Contacts d'urgence"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(patient.emergencyContacts || [
                  { name: "Support Slouma", relationship: "Médical", phone: "190" },
                  { name: "Famille", relationship: "Urgent", phone: "197" }
                ]).map((contact, idx) => (
                  <button 
                    key={idx}
                    onClick={() => window.open(`tel:${contact.phone}`)}
                    className="bg-white border-4 border-red-200 p-6 rounded-3xl flex items-center justify-between group hover:bg-red-600 hover:border-red-700 transition-all active:scale-95 shadow-md"
                  >
                    <div className="text-start">
                      <p className="text-2xl font-black text-slate-900 group-hover:text-white transition-colors">{contact.name}</p>
                      <p className="text-lg font-bold text-red-600 group-hover:text-red-100 transition-colors uppercase tracking-widest">{contact.relationship}</p>
                    </div>
                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-red-600 shadow-inner">
                      <Phone className="w-8 h-8" />
                    </div>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setShowEmergency(true)}
                className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-black text-2xl py-6 rounded-[2rem] shadow-xl border-b-8 border-red-900 active:translate-y-2 active:border-b-0 transition-all flex justify-center items-center gap-4"
              >
                <AlertTriangle className="w-10 h-10 animate-pulse" /> {tp.emergency}
              </button>
            </div>

            {/* Health Vitals Summary (Keeping it as requested "add what you think should be there") */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border-4 border-slate-100">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-teal-50 rounded-[2rem] p-6 border-4 border-teal-100 flex items-center gap-6">
                  <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                    <Heart className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-slate-500 font-black text-sm uppercase">{tp.heartRate}</p>
                    <p className="text-3xl font-black text-teal-900">{latestVitals.heartRate} <span className="text-lg text-teal-700">BPM</span></p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-[2rem] p-6 border-4 border-blue-100 flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                    <Activity className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-slate-500 font-black text-sm uppercase">{tp.bloodPressure}</p>
                    <p className="text-3xl font-black text-blue-900">{latestVitals.bloodPressure}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleDownloadPrescription = (presc) => {
    try {
      if (!presc) throw new Error("Prescription data is missing");

      const doc = new jsPDF();
      
      doc.setFillColor(13, 148, 136);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("SLOUMA SANTE", 105, 20, { align: "center" });
      doc.setFontSize(14);
      doc.text("ORDONNANCE MEDICALE", 105, 30, { align: "center" });
      
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      
      const pName = patient?.name || "Patient";
      const pLast = patient?.lastname || "";
      doc.text(`Patient: ${pName} ${pLast}`, 20, 55);
      doc.text(`Medecin: Dr. ${presc.doctorID || "Inconnu"}`, 20, 65);
      
      const prescDate = presc.date ? new Date(presc.date).toLocaleDateString() : new Date().toLocaleDateString();
      doc.text(`Date: ${prescDate}`, 150, 55);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 75, 190, 75);
      
      const medications = presc.medications || [];
      const tableData = medications.map(med => [
        med.name || "N/A",
        med.dosage || "N/A",
        med.frequency || "N/A",
        med.startDate ? new Date(med.startDate).toLocaleDateString() : "-",
        med.endDate ? new Date(med.endDate).toLocaleDateString() : "-"
      ]);
      
      doc.autoTable({
        startY: 85,
        head: [['Medicament', 'Dosage', 'Frequence', 'Debut', 'Fin']],
        body: tableData,
        headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 85 }
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text(`Genere par Slouma Sante le ${new Date().toLocaleString()}`, 105, 285, { align: "center" });
      }
      
      const fileName = `Ordonnance_${presc.doctorID || "Doc"}_${prescDate.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Detailed PDF generation error:", error);
      alert("Erreur lors de la génération de l'ordonnance. Veuillez réessayer.");
    }
  };

  const PatientPrescriptions = () => {
    const prescriptions = patient.prescriptions?.length > 0 ? patient.prescriptions : [
      {
        doctorID: "DOC-DR001",
        date: new Date(Date.now() - 86400000 * 2),
        status: "Active",
        medications: [
          { name: "Amoxicilline", dosage: "500mg", frequency: "3 fois par jour", startDate: new Date(Date.now() - 86400000 * 2), endDate: new Date(Date.now() + 86400000 * 5) },
          { name: "Paracétamol", dosage: "1g", frequency: "Si besoin", startDate: new Date(Date.now() - 86400000 * 2), endDate: new Date(Date.now() + 86400000 * 10) }
        ]
      },
      {
        doctorID: "DOC-DR002",
        date: new Date(Date.now() - 86400000 * 15),
        status: "Completed",
        medications: [
          { name: "Ibuprofène", dosage: "400mg", frequency: "2 fois par jour", startDate: new Date(Date.now() - 86400000 * 15), endDate: new Date(Date.now() - 86400000 * 10) }
        ]
      }
    ];

    return (
      <div className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-xl border-4 border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <h2 className="text-4xl font-black text-slate-900 flex items-center gap-4">
            <FileText className="w-12 h-12 text-teal-600" />
            {language === 'fr' ? 'Mes Ordonnances' : language === 'ar' || language === 'tn' ? 'وصفاتي الطبية' : 'My Prescriptions'}
          </h2>
          <div className="relative w-full sm:w-auto">
            <Search className={`w-8 h-8 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'}`} />
            <input 
              type="text" 
              placeholder={tp.searchDocs} 
              className={`bg-slate-50 border-4 border-slate-100 text-xl font-bold rounded-2xl py-4 w-full sm:w-80 ${isRtl ? 'pr-16 pl-6' : 'pl-16 pr-6'} focus:border-teal-600 outline-none transition-all shadow-inner`}
            />
          </div>
        </div>

        <div className="space-y-8">
          {prescriptions.map((presc, index) => (
            <div key={index} className="p-8 border-4 border-slate-100 bg-white rounded-[2.5rem] flex flex-col gap-6 hover:border-teal-300 shadow-lg transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div className="flex gap-6 items-center">
                  <div className={`w-20 h-20 rounded-[1.5rem] border-4 flex items-center justify-center shrink-0 shadow-inner ${presc.status === 'Active' ? 'bg-teal-100 text-teal-900 border-teal-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    <FileText className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Dr. {presc.doctorID}</h3>
                    <p className="text-lg font-bold text-slate-500">{new Date(presc.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-5 py-2 rounded-xl text-sm font-black border-2 ${presc.status === 'Active' ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                    {presc.status}
                  </span>
                  <button 
                    onClick={() => handleDownloadPrescription(presc)}
                    className="w-14 h-14 bg-slate-800 text-white hover:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90"
                  >
                    <Download className="w-8 h-8" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-100 space-y-4 relative z-10">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{language === 'fr' ? 'Médicaments prescrits' : 'Prescribed Medications'}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {presc.medications.map((med, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                        <Pill className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{med.name} <span className="text-teal-600">({med.dosage})</span></p>
                        <p className="text-sm font-bold text-slate-500">{med.frequency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {showSidebar && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar - Large clear links */}
      <aside className={`fixed ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} top-0 bottom-0 w-80 bg-white border-slate-200 z-50 sidebar-transition flex flex-col shadow-2xl ${
        showSidebar ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
      }`}>
        <div className="h-32 flex items-center px-8 border-b-4 border-slate-100 bg-slate-50 shrink-0 relative">
          <Heart className="w-14 h-14 text-teal-700 shrink-0" />
          <div className="ms-4 flex-1 min-w-0">
            <span className="font-black text-3xl text-slate-900 tracking-tight leading-none block truncate">
              Slouma<br/><span className="text-teal-700">Santé</span>
            </span>
          </div>
          <button 
            onClick={() => setShowSidebar(false)}
            className="absolute top-4 end-4 p-2 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <XCircle className="w-10 h-10" />
          </button>
        </div>

        <nav className="flex-1 py-8 px-6 space-y-4">
          {[
            { id: 'home', icon: Home, label: tp.dashboard, color: 'text-teal-700', active: 'bg-teal-700 text-white' },
            { id: 'emergency', icon: AlertTriangle, label: tp.emergencyContacts || 'Urgence', color: 'text-red-700', active: 'bg-red-700 text-white' },
            { id: 'prescriptions', icon: FileText, label: language === 'fr' ? 'Ordonnances' : language === 'ar' || language === 'tn' ? 'وصفات طبية' : 'Prescriptions', color: 'text-teal-700', active: 'bg-teal-700 text-white' },
            { id: 'messages', icon: MessageCircle, label: tc.messages, color: 'text-teal-700', active: 'bg-teal-700 text-white' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setShowSidebar(false); }}
              className={`w-full flex items-center px-6 py-6 text-2xl font-black rounded-3xl transition-all border-4 gap-6 ${
                activeTab === item.id 
                  ? `${item.active} border-transparent shadow-xl` 
                  : `border-slate-100 text-slate-700 hover:bg-slate-100`
              }`}
            >
              <item.icon className={`w-10 h-10 shrink-0 ${activeTab === item.id ? 'text-white' : item.color}`} />
              <span className="flex-1 text-start truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t-4 border-slate-100 space-y-4 bg-slate-50">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center px-6 py-5 text-xl font-black text-slate-700 bg-white border-4 border-slate-200 hover:bg-slate-200 rounded-2xl shadow-sm gap-4"
          >
            <Settings className="w-8 h-8 shrink-0 text-slate-500" />
            <span className="flex-1 text-start truncate">{tc.settings}</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center px-6 py-5 text-xl font-black text-rose-700 bg-rose-100 border-4 border-rose-200 hover:bg-rose-200 rounded-2xl shadow-sm gap-4"
          >
            <LogOut className="w-8 h-8 shrink-0 text-rose-500" />
            <span className="flex-1 text-start truncate">{tc.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 main-content-transition lg:${isRtl ? (showSidebar ? 'mr-80' : 'mr-0') : (showSidebar ? 'ml-80' : 'ml-0')} flex flex-col min-h-screen`}>
        
        {/* Top Header - High contrast, huge icons */}
        <header className="h-28 bg-white border-b-4 border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 sm:px-12 shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowSidebar(!showSidebar)} 
              className="p-4 bg-slate-100 rounded-2xl text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <Menu className="w-10 h-10" />
            </button>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize hidden sm:block">
              {{
                home: tp.dashboard,
                emergency: tp.emergencyContacts,
                prescriptions: language === 'fr' ? 'Ordonnances' : language === 'ar' || language === 'tn' ? 'وصفات طبية' : 'Prescriptions',
                messages: tc.messages
              }[activeTab]}
            </h2>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200"
              >
                <Globe className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-bold text-slate-700">{tc.langLabel[language]}</span>
              </button>
              {showLanguageMenu && (
                <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 min-w-[180px] origin-top-right">
                  {tc.langOptions.map((l) => (
                    <button key={l.code} onClick={() => { setLanguage(l.code); setShowLanguageMenu(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm ${language === l.code ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowNotifications(true)}
            className="relative p-4 bg-teal-50 border-4 border-teal-100 text-teal-700 rounded-2xl shadow-md"
            >
              <Bell className="w-8 h-8" />
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full border-4 border-white"></span>
            </button>
            
            <div className="flex items-center gap-4 bg-slate-100 px-6 py-3 rounded-3xl border-4 border-slate-200">
              <div className="w-14 h-14 bg-teal-700 text-white font-black text-2xl flex items-center justify-center rounded-2xl shadow-md">
                {patient.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-2xl font-black text-slate-900 leading-none">{patient.name.split(' ')[0]}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 sm:p-12">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Context Header */}
            {activeTab === 'home' && (
              <div className="mb-8 pl-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                  {tp.hello}, {patient.name.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-600 text-xl font-bold">{tp.howAreYou}</p>
              </div>
            )}

            {activeTab === 'home' && <PatientOverview />}

            {activeTab === 'emergency' && (
              <div className="bg-red-50 border-4 border-red-100 rounded-[3rem] p-8 sm:p-12 shadow-2xl">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-4xl font-black text-red-900 flex items-center gap-6">
                    <Phone className="w-14 h-14 text-red-600" />
                    {tp.emergencyContacts}
                  </h2>
                  <button 
                    onClick={() => setIsAddingContact(!isAddingContact)}
                    className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl shadow-lg transition-all active:scale-90"
                  >
                    {isAddingContact ? <XCircle className="w-8 h-8" /> : <PlusCircle className="w-8 h-8" />}
                  </button>
                </div>

                {isAddingContact && (
                  <form onSubmit={handleAddContact} className="bg-white border-4 border-red-100 p-8 rounded-[2rem] mb-12 shadow-xl animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-lg font-black text-slate-700 ml-2">Nom</label>
                        <input 
                          type="text" 
                          required
                          value={newContact.name}
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          placeholder="Nom du contact"
                          className="w-full bg-slate-50 border-4 border-slate-100 rounded-2xl py-4 px-6 text-xl font-bold focus:border-red-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-lg font-black text-slate-700 ml-2">Relation</label>
                        <input 
                          type="text" 
                          required
                          value={newContact.relationship}
                          onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                          placeholder="Ex: Famille, Ami"
                          className="w-full bg-slate-50 border-4 border-slate-100 rounded-2xl py-4 px-6 text-xl font-bold focus:border-red-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-lg font-black text-slate-700 ml-2">Téléphone</label>
                        <input 
                          type="tel" 
                          required
                          pattern="^[0-9]{8}$"
                          maxLength="8"
                          title="Veuillez entrer un numéro de téléphone tunisien valide (8 chiffres)"
                          value={newContact.phone}
                          onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                          placeholder="Numéro de téléphone (8 chiffres)"
                          className="w-full bg-slate-50 border-4 border-slate-100 rounded-2xl py-4 px-6 text-xl font-bold focus:border-red-500 outline-none"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full bg-red-600 hover:bg-red-700 text-white font-black text-2xl py-5 rounded-2xl shadow-lg transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? 'Ajout en cours...' : 'Ajouter le contact'}
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {(patient.emergencyContacts && patient.emergencyContacts.length > 0) ? patient.emergencyContacts.map((contact, idx) => (
                    <div 
                      key={contact._id || idx}
                      className="bg-white border-4 border-red-200 p-8 rounded-[2rem] flex items-center justify-between group hover:border-red-600 transition-all shadow-lg relative"
                    >
                      <div className="text-start flex-1" onClick={() => window.location.href = `tel:${contact.phone}`} style={{ cursor: 'pointer' }}>
                        <p className="text-3xl font-black text-slate-900 group-hover:text-red-700 transition-colors">{contact.name}</p>
                        <p className="text-xl font-bold text-red-600 uppercase tracking-widest">{contact.relationship}</p>
                        <p className="text-2xl font-black text-slate-400 mt-2">{contact.phone}</p>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => window.location.href = `tel:${contact.phone}`}
                          className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-inner"
                        >
                          <Phone className="w-8 h-8" />
                        </button>
                        <button 
                          onClick={() => handleDeleteContact(contact._id)}
                          className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-100 hover:text-rose-600 transition-all shadow-inner"
                        >
                          <XCircle className="w-8 h-8" />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="md:col-span-2 py-20 text-center bg-white/50 rounded-[2rem] border-4 border-dashed border-red-200">
                      <p className="text-2xl font-bold text-red-300">Aucun contact d'urgence personnalisé</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                   <h3 className="text-2xl font-black text-red-800/50 uppercase tracking-widest mb-4">Numéros d'urgence nationaux</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={() => window.location.href = `tel:190`}
                        className="bg-white/50 border-4 border-red-100 p-6 rounded-3xl flex items-center justify-between group hover:bg-red-600 transition-all"
                      >
                        <div className="text-start">
                          <p className="text-2xl font-black text-slate-700 group-hover:text-white">SAMU</p>
                          <p className="text-xl font-bold text-red-500 group-hover:text-red-100">190</p>
                        </div>
                        <Phone className="w-8 h-8 text-red-400 group-hover:text-white" />
                      </button>
                      <button 
                        onClick={() => window.location.href = `tel:197`}
                        className="bg-white/50 border-4 border-red-100 p-6 rounded-3xl flex items-center justify-between group hover:bg-red-600 transition-all"
                      >
                        <div className="text-start">
                          <p className="text-2xl font-black text-slate-700 group-hover:text-white">Police</p>
                          <p className="text-xl font-bold text-red-500 group-hover:text-red-100">197</p>
                        </div>
                        <Phone className="w-8 h-8 text-red-400 group-hover:text-white" />
                      </button>
                   </div>
                </div>

                <button 
                  onClick={() => setShowEmergency(true)}
                  className="w-full mt-12 bg-red-600 hover:bg-red-700 text-white font-black text-3xl py-8 rounded-[2rem] shadow-2xl border-b-[12px] border-red-900 active:translate-y-2 active:border-b-4 transition-all flex justify-center items-center gap-6"
                >
                  <AlertTriangle className="w-12 h-12 animate-pulse" /> {tp.emergency}
                </button>
              </div>
            )}

            {activeTab === 'prescriptions' && <PatientPrescriptions />}
            {activeTab === 'messages' && (
              <MessagesSection 
                language={language} 
                currentUser={{ id: patient?._id || patient?.id, name: patient?.name || 'Patient', role: 'patient' }} 
              />
            )}
            
          </div>
        </div>
      </main>

      {/* Modals */}
      {showEmergency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <EmergencyModal onClose={() => setShowEmergency(false)} language={language} isPatient={true} currentUser={patient} />
        </div>
      )}

      {showVoiceAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <VoiceAssistantModal onClose={() => setShowVoiceAssistant(false)} language={language} isPatient={true} />
        </div>
      )}

      {/* Floating Toggle Button when sidebar is closed */}
      {!showSidebar && (
        <button 
          onClick={() => setShowSidebar(true)}
          className={`fixed top-1/2 -translate-y-1/2 z-40 bg-white p-4 shadow-xl border-y-4 border-${isRtl ? 'l' : 'r'}-4 border-slate-200 text-slate-800 hover:bg-slate-100 transition-all ${isRtl ? 'right-0 rounded-l-3xl' : 'left-0 rounded-r-3xl'}`}
        >
          <Menu className="w-8 h-8" />
        </button>
      )}

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
        userRole="patient"
      />
    </div>
  );
}
