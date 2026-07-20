import React, { useState } from 'react';
import { Activity, Phone, Pill, Users, X, Loader } from 'lucide-react';
import { messagesService } from '../services/messagesService';

export default function EmergencyModal({ onClose, language, isPatient, currentUser }) {
  const [loadingAction, setLoadingAction] = useState(null);

  const t = {
    title: 'Aide urgente',
    callAmbulance: 'Appeler ambulance',
    callFamily: 'Appeler famille',
    feelingUnwell: 'Malaise',
    needMedicine: 'Besoin médicament',
  };

  const handleUrgentAction = async (type) => {
    if (!currentUser) return;
    setLoadingAction(type);
    
    const text = type === 'medicine' 
      ? "URGENCE : J'ai besoin de mon médicament !" 
      : "URGENCE : Je fais un malaise !";
      
    const roomName = `Urgence-${currentUser._id || currentUser.id}`;
    const callLink = `https://meet.jit.si/${roomName}`;

    try {
        const contacts = await messagesService.getContacts(currentUser._id || currentUser.id, 'patient');
        const doctorsAndCaregivers = contacts.filter(c => c.role === 'doctor' || c.role === 'caregiver');
        
        const sendPromises = doctorsAndCaregivers.map(contact => 
            messagesService.sendMessage({
                senderID: currentUser._id || currentUser.id,
                receiverID: contact.id,
                message: `${text} Rejoignez l'appel en urgence : ${callLink}`,
                date: new Date().toISOString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
        );
        
        await Promise.all(sendPromises);
        
        // Start call
        window.open(callLink, '_blank');
        onClose();
    } catch (e) {
        console.error("Failed to handle urgent action", e);
        alert("Erreur lors de l'envoi de l'alerte.");
    } finally {
        setLoadingAction(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-3xl max-w-md w-full ${
          isPatient ? 'p-10' : 'p-8'
        } shadow-2xl relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className={isPatient ? 'w-10 h-10' : 'w-6 h-6'} />
        </button>

        <div className="text-center mb-8">
          <div
            className={`${
              isPatient ? 'w-24 h-24' : 'w-20 h-20'
            } bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <span className={isPatient ? 'text-6xl' : 'text-5xl'}>🚨</span>
          </div>
          <h2
            className={`${
              isPatient ? 'text-4xl' : 'text-3xl'
            } font-black text-slate-800 mb-2 tracking-tight`}
          >
            {t.title}
          </h2>
        </div>

        <div className="space-y-4">
          <button onClick={() => window.location.href = `tel:190`} className={`w-full bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl ${
            isPatient ? 'py-6 text-2xl' : 'py-4 text-xl'
          } font-black hover:shadow-xl transition-all flex items-center justify-center gap-3`}>
            <Phone className={isPatient ? 'w-8 h-8' : 'w-6 h-6'} />
            {t.callAmbulance} - 190
          </button>
          {/* Note: This is an example, could point to first emergency contact */}
          <button className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl ${
            isPatient ? 'py-6 text-2xl' : 'py-4 text-xl'
          } font-black hover:shadow-xl transition-all flex items-center justify-center gap-3`}>
            <Users className={isPatient ? 'w-8 h-8' : 'w-6 h-6'} />
            {t.callFamily}
          </button>
          {isPatient && (
            <>
              <button 
                onClick={() => handleUrgentAction('medicine')}
                disabled={loadingAction !== null}
                className="w-full border-2 border-slate-200 text-slate-700 rounded-2xl py-6 text-2xl font-black hover:bg-slate-50 hover:border-teal-200 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
              >
                {loadingAction === 'medicine' ? <Loader className="w-8 h-8 animate-spin text-teal-600" /> : <Pill className="w-8 h-8 text-teal-600" />}
                {t.needMedicine}
              </button>
              <button 
                onClick={() => handleUrgentAction('unwell')}
                disabled={loadingAction !== null}
                className="w-full border-2 border-slate-200 text-slate-700 rounded-2xl py-6 text-2xl font-black hover:bg-slate-50 hover:border-teal-200 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
              >
                {loadingAction === 'unwell' ? <Loader className="w-8 h-8 animate-spin text-rose-500" /> : <Activity className="w-8 h-8 text-rose-500" />}
                {t.feelingUnwell}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
