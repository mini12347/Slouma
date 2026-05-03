import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Info, AlertTriangle, Clock } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { translations } from './translations';


export default function NotificationsPanel({ isOpen, onClose, language, userId, userRole, onUpdate }) {

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isOpen && userId) {
      notificationService.getUserNotifications(userId)
        .then(data => {
          if (data && data.length > 0) {
            setNotifications(data);
          } else {
            const now = new Date();
            const mockNotifs = [];
            const roleKey = userRole?.toLowerCase() || 'patient';

            const mockContents = {
              doctor: [
                { type: 'alert', message: 'Urgent: Patient Ali Ben Salem signal un malaise.', time: new Date(now - 1000 * 60 * 15) },
                { type: 'info', message: 'Nouveau rendez-vous programmé avec Fatma Khelifi.', time: new Date(now - 1000 * 60 * 60 * 2) },
                { type: 'success', message: 'Le rapport mensuel du service Cardiologie est prêt.', time: new Date(now - 1000 * 60 * 60 * 24) }
              ],
              patient: [
                { type: 'info', message: 'Rappel: Votre rendez-vous avec Dr. Mansour est demain à 10:00.', time: new Date(now - 1000 * 60 * 30) },
                { type: 'success', message: 'Votre ordonnance a été renouvelée avec succès.', time: new Date(now - 1000 * 60 * 60 * 5) },
                { type: 'alert', message: 'Attention: Votre stock de Paracétamol est presque épuisé.', time: new Date(now - 1000 * 60 * 60 * 12) }
              ],
              caregiver: [
                { type: 'alert', message: 'Alerte: La tension de votre patient est anormalement élevée.', time: new Date(now - 1000 * 60 * 10) },
                { type: 'info', message: 'Rappel: Administration de l\'insuline prévue à 12:00.', time: new Date(now - 1000 * 60 * 60) },
                { type: 'success', message: 'Visite à domicile confirmée pour demain.', time: new Date(now - 1000 * 60 * 60 * 3) }
              ],
              admin: [
                { type: 'info', message: 'Nouvel utilisateur en attente d\'approbation: Dr. Samir.', time: new Date(now - 1000 * 60 * 20) },
                { type: 'alert', message: 'Le serveur a détecté une tentative de connexion inhabituelle.', time: new Date(now - 1000 * 60 * 60 * 4) },
                { type: 'success', message: 'La sauvegarde hebdomadaire du système est terminée.', time: new Date(now - 1000 * 60 * 60 * 18) }
              ]
            };

            const contents = mockContents[roleKey] || mockContents.patient;
            
            contents.forEach((c, i) => {
              mockNotifs.push({
                _id: `MOCK-${roleKey}-${i}`,
                type: c.type,
                message: c.message,
                time: c.time,
                read: false,
                title: c.type === 'alert' ? 'Alerte' : c.type === 'success' ? 'Succès' : 'Information'
              });
            });
            setNotifications(mockNotifs);
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [isOpen, userId, userRole, language]);

  if (!isOpen) return null;

  const tr = translations[language] || translations.en;
  const t = tr.common.notification;

  const isRtl = language === 'ar' || language === 'tn';

  const handleMarkAllRead = async () => {
    if (!userId) return;
    try {
      if (notifications.some(n => n._id.startsWith('MOCK'))) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } else {
        await notificationService.markAllAsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (date) => {
    if (!date) return t.justNow;
    const diff = new Date() - new Date(date);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return t.justNow;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}${t.minsAgo}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}${t.hoursAgo}`;
    return new Date(date).toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-teal-600" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info':
      default: return <Info className="w-5 h-5 text-teal-600" />;
    }
  };

  const getTitle = (notif) => {
    if (notif.title && notif.title !== 'Notification' && notif.title !== 'Alert' && notif.title !== 'Success') {
      return notif.title;
    }
    return t.types[notif.type] || t.types.info;
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div 
        className={`fixed top-0 bottom-0 ${isRtl ? 'left-0 border-r' : 'right-0 border-l'} w-80 sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <Bell className="w-5 h-5" />
            <h2 className="font-semibold">{t.title}</h2>
            <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-end px-4 py-2 border-b border-slate-100 bg-white">
          <button onClick={handleMarkAllRead} className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
            {t.markAllRead}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <div 
                  key={notif._id || notif.id}
                  className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4 ${!notif.read ? 'bg-teal-50/30' : 'bg-white'}`}
                >
                  <div className="shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className={`text-sm font-semibold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {getTitle(notif)}
                      </h4>

                      <span className="text-xs font-medium text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(notif.time || notif.date)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {notif.message || notif.content}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Bell className="w-12 h-12 mb-4 text-slate-200" />
              <p>{t.empty}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
