import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, MessageCircle, Check, MoreVertical, Paperclip, 
  Smile, Phone, Video, Search, ShieldCheck, HeartPulse, Stethoscope
} from 'lucide-react';
import { messagesService } from '../services/messagesService';
import { notificationService } from '../services/notificationService';
import api from '../services/api';
import { translations } from './translations';

export default function MessagesSection({ language, userRole = 'patient', currentUser }) {
  const tc = (translations[language] || translations.fr).common;
  const [message, setMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [chatHistory, setChatHistory] = useState({});

  const scrollRef = useRef(null);
  const isRtl = language === 'ar' || language === 'tn';
  const isPatientUI = userRole === 'patient';

  useEffect(() => {
    const rawId = currentUser?.id || currentUser?._id;
    const currentId = rawId ? rawId.toString() : null;
    if (currentId) {
       messagesService.getContacts(currentId, userRole).then(contacts => {
         setAvailableContacts(contacts || []);
       }).catch(err => {
         console.error('Failed to load contacts:', err);
         setAvailableContacts([]);
       });
    }
  }, [currentUser, userRole]);

  useEffect(() => {
    const rawId = currentUser?.id || currentUser?._id;
    const currentId = rawId ? rawId.toString() : null;
    
    const fetchHistory = () => {
      if (selectedContact && currentId) {
        messagesService.getChatHistory(currentId, selectedContact.id).then(history => {
          setChatHistory(prev => ({
            ...prev,
            [selectedContact.id]: history || []
          }));
        }).catch(err => {
          console.error('Failed to load history:', err);
        });
      }
    };

    fetchHistory();
    const intervalId = setInterval(fetchHistory, 3000);
    return () => clearInterval(intervalId);
  }, [selectedContact, currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, selectedContact]);

  const handleReportUser = async () => {
    try {
      const admins = await api.get('/admins');
      const admin = Array.isArray(admins) ? admins[0] : admins?.admins?.[0];
      if (!admin) { alert(tc.noAdminFound || 'No admin found.'); return; }
      const adminId = admin.id || admin._id;
      await notificationService.createNotification({
        id: 'report-' + Date.now(),
        receiverID: adminId,
        content: `User ${currentUser?.name || currentUser?.id} reported ${selectedContact.name} (${selectedContact.id})`,
        date: new Date(),
        type: 'alert',
        read: false
      });
      alert(tc.userReported || 'User reported to admin.');
    } catch (err) {
      console.error('Failed to report user:', err);
      alert(tc.failedReportUser || 'Failed to report user.');
    }
  };

  const handleBlockUser = async () => {
    const rawId = currentUser?.id || currentUser?._id;
    const currentId = rawId ? rawId.toString() : null;
    if (!currentId || !selectedContact) return;
    try {
      await messagesService.blockUser(currentId, selectedContact.id);
      setAvailableContacts(prev => prev.filter(c => c.id !== selectedContact.id));
      setSelectedContact(null);
      setShowContactMenu(false);
      alert(tc.userBlocked || 'User blocked and conversation deleted.');
    } catch (err) {
      console.error('Failed to block user:', err);
      alert(tc.failedBlockUser || 'Failed to block user.');
    }
  };

  const filteredContacts = availableContacts.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || c.role === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSend = async () => {
    const rawId = currentUser?.id || currentUser?._id;
    const currentId = rawId ? rawId.toString() : null;
    if (message.trim() === '' || !selectedContact || !currentId) return;

    const msgText = message;
    setMessage('');

    const newMsg = {
      senderID: currentId,
      receiverID: selectedContact.id,
      message: msgText,
      date: new Date(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      text: msgText
    };

    setChatHistory(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg]
    }));

    try {
      await messagesService.sendMessage({
        senderID: currentId,
        receiverID: selectedContact.id,
        message: msgText,
        date: new Date(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setChatHistory(prev => ({
        ...prev,
        [selectedContact.id]: (prev[selectedContact.id] || []).slice(0, -1)
      }));
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'doctor': return <Stethoscope className="w-3 h-3" />;
      case 'caregiver': return <HeartPulse className="w-3 h-3" />;
      case 'admin': return <ShieldCheck className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'doctor': return 'bg-blue-100 text-blue-700';
      case 'caregiver': return 'bg-emerald-100 text-emerald-700';
      case 'admin': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const tRoles = {
    patient: tc.roles?.patient || 'Patient',
    doctor: tc.roles?.doctor || 'Doctor',
    caregiver: tc.roles?.caregiver || 'Caregiver',
    admin: tc.roles?.admin || 'Admin'
  };

  return (
    <div className={`flex h-[calc(100vh-160px)] bg-slate-50 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl ${isRtl ? 'flex-row-reverse' : ''}`}>
      
      {/* Sidebar - Contacts */}
      <div className={`w-80 sm:w-96 bg-white border-${isRtl ? 'l' : 'r'}-4 border-slate-50 flex flex-col shrink-0`}>
        <div className="p-6 border-b-4 border-slate-50">
          {/* Debug info - only visible in development or when something is wrong */}
          {availableContacts.length === 0 && (
            <div className="text-[8px] text-slate-300 mb-2">
              ID: {currentUser?.id || currentUser?._id || 'None'} | Role: {userRole}
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-black text-slate-900 ${isPatientUI ? 'tracking-tight' : ''}`}>{tc.messages || 'Messages'}</h3>
          </div>
          
          <div className="relative mb-6">
            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} w-5 h-5 text-slate-400`} />
            <input 
              type="text" 
              placeholder={tc.searchContacts || "Rechercher..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-slate-100 border-2 border-transparent focus:border-teal-600 rounded-2xl py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} font-bold text-slate-700 outline-none transition-all`}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all border-2 whitespace-nowrap ${filterType === 'all' ? 'bg-teal-700 border-teal-700 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-teal-300'}`}
            >
              {tc.all || "Tous"}
            </button>
            {(() => {
              const roleMap = {
                doctor:    ['patient', 'caregiver', 'admin'],
                caregiver: ['patient', 'doctor', 'admin'],
                patient:   ['doctor', 'caregiver', 'admin'],
                admin:     ['doctor', 'caregiver', 'patient', 'admin'],
              };
              return (roleMap[userRole] || []).map(role => (
                <button 
                  key={role}
                  onClick={() => setFilterType(role)}
                  className={`px-4 py-1.5 rounded-full text-xs font-black transition-all border-2 whitespace-nowrap capitalize ${filterType === role ? 'bg-teal-700 border-teal-700 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-teal-300'}`}
                >
                  {tRoles[role]}
                </button>
              ));
            })()}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <button 
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center gap-4 p-4 transition-all border-b border-slate-50 ${selectedContact?.id === contact.id ? 'bg-teal-50 shadow-inner' : 'bg-transparent hover:bg-slate-50'}`}
              >
                <div className="relative shrink-0">
                  <img src={contact.avatar || 'https://i.pravatar.cc/150'} alt={contact.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-emerald-500' : contact.status === 'away' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                </div>
                <div className="flex-1 text-left min-w-0" dir={isRtl ? 'rtl' : 'ltr'}>
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-slate-800 text-base truncate">{contact.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{contact.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${getRoleColor(contact.role)}`}>
                      {getRoleIcon(contact.role)}
                      {tRoles[contact.role]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-bold mt-1.5 truncate">{contact.lastMsg || (tc.noMessages || 'Aucun message')}</p>
                </div>
                {contact.unread > 0 && (
                  <div className="w-6 h-6 bg-teal-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg">{contact.unread}</div>
                )}
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-xl font-black text-slate-900 mb-2">{tc.noContact || 'Aucun contact'}</p>
              <p className="text-sm font-bold text-slate-500">
                {searchQuery ? (tc.noResult || "Aucun résultat trouvé") : (tc.noContactsAvailable || "Vous n'avez pas encore de contacts disponibles.")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {selectedContact ? (
          <>
            <div className={`p-6 border-b-4 border-slate-50 flex items-center justify-between shrink-0 ${isPatientUI ? 'bg-teal-50/30' : 'bg-slate-50/30'}`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg shrink-0">
                  <img src={selectedContact.avatar || 'https://i.pravatar.cc/150'} alt={selectedContact.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className={`font-black tracking-tight ${isPatientUI ? 'text-2xl text-teal-950' : 'text-xl text-slate-800'}`}>{selectedContact.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedContact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedContact.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { const ids = [currentUser?.id || currentUser?._id, selectedContact.id].filter(Boolean).sort().join('-'); window.open(`https://meet.jit.si/Slouma-Chat-${ids}?config.startWithVideoMuted=true`, '_blank'); }} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-teal-700 hover:text-white transition-all active:scale-90">
                  <Phone className="w-6 h-6" />
                </button>
                <button onClick={() => { const ids = [currentUser?.id || currentUser?._id, selectedContact.id].filter(Boolean).sort().join('-'); window.open(`https://meet.jit.si/Slouma-Chat-${ids}`, '_blank'); }} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-teal-700 hover:text-white transition-all active:scale-90">
                  <Video className="w-6 h-6" />
                </button>
                <div className="relative">
                  <button onClick={() => setShowContactMenu(!showContactMenu)} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all active:scale-90">
                    <MoreVertical className="w-6 h-6" />
                  </button>
                  {showContactMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowContactMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden">
                        <button onClick={() => { setShowContactMenu(false); handleReportUser(); }} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-all text-left">
                          <ShieldCheck className="w-5 h-5" />
                          {tc.reportUser || 'Report user'}
                        </button>
                        <div className="mx-4 border-t border-slate-100" />
                        <button onClick={() => { setShowContactMenu(false); handleBlockUser(); }} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all text-left">
                          <ShieldCheck className="w-5 h-5" />
                          {tc.blockUser || 'Block user'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
              {(chatHistory[selectedContact.id] || []).map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[75%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3 rounded-[2rem] shadow-sm ${
                      msg.isMe 
                        ? 'bg-teal-700 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    }`}>
                      <p className="text-lg font-bold">{msg.message || msg.text}</p>
                      <div className={`flex items-center gap-1.5 mt-2 opacity-60 text-[10px] font-black ${msg.isMe ? 'text-teal-50' : 'text-slate-400'}`}>
                        <span>{msg.time}</span>
                        {msg.isMe && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t-4 border-slate-50 shrink-0">
              <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-[2rem] border-2 border-transparent focus-within:border-teal-600 transition-all">
                <button className="p-3 text-slate-400 hover:text-teal-700 transition-all">
                  <Paperclip className="w-6 h-6" />
                </button>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={tc.typeMessage || "Écrivez votre message..."}
                  className="flex-1 bg-transparent py-3 px-2 font-bold text-slate-700 outline-none"
                />
                <button className="p-3 text-slate-400 hover:text-teal-700 transition-all">
                  <Smile className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleSend}
                  className="bg-teal-700 text-white p-4 rounded-full shadow-lg hover:bg-teal-800 transition-all active:scale-90"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl border-4 border-teal-50">
              <MessageCircle className="w-16 h-16 text-teal-700 opacity-20" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{tc.selectConversation || 'Sélectionnez une conversation'}</h2>
            <p className="text-xl font-bold text-slate-500 max-w-md">{tc.selectConversationDesc || 'Choisissez un contact dans la liste à gauche pour commencer à discuter.'}</p>
          </div>
        )}
      </div>

    </div>
  );
}
