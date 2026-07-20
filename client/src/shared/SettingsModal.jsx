import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Smartphone, Globe, Save, Loader2, CheckCircle2, AlertCircle, Shield, Lock, KeyRound
} from 'lucide-react';
import { userService } from '../services/userService';
import { translations } from './translations';

export default function SettingsModal({ isOpen, onClose, language, currentUser, onUpdate }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailPassword: '',
    newEmail: ''
  });

  const passwordRequirements = [
    { regex: /.{8,}/, label: 'Minimum 8 characters' },
    { regex: /[A-Z]/, label: 'At least one uppercase letter' },
    { regex: /[a-z]/, label: 'At least one lowercase letter' },
    { regex: /\d/, label: 'At least one number' },
    { regex: /[@$!%*?&#]/, label: 'At least one special character (@$!%*?&#)' },
  ];

  const validatePassword = (pass) => {
    return passwordRequirements.every(req => req.regex.test(pass));
  };

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const t = translations[language] || translations.en;
  const ts = t.settings;

  useEffect(() => {
    if (currentUser && isOpen) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      });
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        emailPassword: '',
        newEmail: currentUser.email || ''
      });
      setMessage({ type: '', text: '' });
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const isRtl = language === 'ar' || language === 'tn';

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const updated = await userService.updateProfile(currentUser.id || currentUser._id, {
        ...profileData,
        role: currentUser.role
      });
      if (onUpdate) onUpdate(updated);
      setMessage({ type: 'success', text: ts.profile.saveMsg || 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || ts.profile.errorMsg || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage({ type: 'error', text: ts.security.password.mismatch || 'Passwords do not match' });
      return;
    }
    if (!validatePassword(securityData.newPassword)) {
      setMessage({ type: 'error', text: 'Password does not meet the security requirements.' });
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await userService.changePassword(currentUser.id || currentUser._id, {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword,
        role: currentUser.role
      });
      setMessage({ type: 'success', text: ts.security.password.success || 'Password changed successfully!' });
      setSecurityData({ ...securityData, currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await userService.changeEmail(currentUser.id || currentUser._id, {
        password: securityData.emailPassword,
        newEmail: securityData.newEmail,
        role: currentUser.role
      });
      if (onUpdate) onUpdate({ ...currentUser, email: response.email });
      setMessage({ type: 'success', text: 'Email updated successfully!' });
      setSecurityData({ ...securityData, emailPassword: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to change email' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 w-full max-w-2xl overflow-hidden flex flex-col border border-white animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between bg-teal-700 text-white shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-inner border border-white/10">
              {activeTab === 'profile' ? <User className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                {activeTab === 'profile' ? (ts.tabs.profile || "Profile") : (ts.tabs.security || "Security")}
              </h2>
              <div className="flex gap-4 mt-1">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`text-sm font-bold transition-all ${activeTab === 'profile' ? 'text-white' : 'text-teal-200/60 hover:text-white'}`}
                >
                  {ts.tabs.profile || "Profile"}
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`text-sm font-bold transition-all ${activeTab === 'security' ? 'text-white' : 'text-teal-200/60 hover:text-white'}`}
                >
                  {ts.tabs.security || "Security"}
                </button>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[75vh] custom-scrollbar bg-white">
          {message.text && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-2 ${
              message.type === 'success' 
                ? 'bg-teal-50 text-teal-700 border border-teal-100' 
                : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileUpdate} className="space-y-8">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-28 h-28 bg-teal-600 text-white rounded-3xl flex items-center justify-center text-4xl font-black shadow-xl shadow-teal-600/10 border-4 border-white transition-transform group-hover:scale-105 duration-300">
                    {profileData.name?.substring(0, 2).toUpperCase() || 'US'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                     <User className="w-3 h-3 text-teal-500" /> {ts.profile.name || "Full Name"}
                  </label>
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 hover:border-slate-300" 
                    placeholder={ts.profile.name || "Full Name"}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <Mail className="w-3 h-3 text-teal-500" /> {ts.profile.email || "Email"}
                  </label>
                  <input 
                    type="email" 
                    disabled
                    value={profileData.email}
                    className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-bold text-slate-500 cursor-not-allowed"
                    placeholder={ts.profile.email || "Email"}
                  />
                  <p className="text-[10px] text-slate-400 ml-1">Change email in Security tab</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <Smartphone className="w-3 h-3 text-teal-500" /> {ts.profile.phone || "Phone Number"}
                  </label>
                  <input 
                    type="tel" 
                    pattern="^[0-9]{8}$"
                    maxLength="8"
                    title="Veuillez entrer un numéro de téléphone tunisien valide (8 chiffres)"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 hover:border-slate-300"
                    placeholder={ts.profile.phone || "Phone Number"}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <Globe className="w-3 h-3 text-teal-500" /> {ts.profile.address || "Address"}
                  </label>
                  <input 
                    type="text" 
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 hover:border-slate-300"
                    placeholder={ts.profile.address || "Address"}
                  />
                </div>
              </div>

              <div className="pt-8 mt-4 flex justify-end gap-4 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="group px-8 py-4 bg-teal-700 text-white font-black rounded-2xl hover:bg-teal-800 hover:shadow-lg hover:shadow-teal-600/25 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                  {t.common?.save || "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-12">
              {/* Email Change */}
              <form onSubmit={handleEmailChange} className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">Change Email Address</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      New Email
                    </label>
                    <input 
                      type="email" 
                      required
                      value={securityData.newEmail}
                      onChange={(e) => setSecurityData({...securityData, newEmail: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Current Password
                    </label>
                    <input 
                      type="password" 
                      required
                      value={securityData.emailPassword}
                      onChange={(e) => setSecurityData({...securityData, emailPassword: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 transition-all disabled:opacity-50"
                  >
                    Update Email
                  </button>
                </div>
              </form>

              {/* Password Change */}
              <form onSubmit={handlePasswordChange} className="space-y-6 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">{ts.security.password.title || "Password Management"}</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {ts.security.password.current || "Current Password"}
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        required
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                        className="w-full pl-12 pr-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        {ts.security.password.new || "New Password"}
                      </label>
                      <input 
                        type="password" 
                        required
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                      />
                      {securityData.newPassword && (
                        <div className="mt-3 space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          {passwordRequirements.map((req, idx) => {
                            const isMet = req.regex.test(securityData.newPassword);
                            return (
                              <div key={idx} className="flex items-center gap-2">
                                <CheckCircle2 className={`w-3.5 h-3.5 ${isMet ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <span className={`text-[10px] font-bold ${isMet ? 'text-emerald-700' : 'text-slate-400'}`}>
                                  {req.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        {ts.security.password.confirm || "Confirm New Password"}
                      </label>
                      <input 
                        type="password" 
                        required
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-teal-700 text-white text-sm font-bold rounded-xl hover:bg-teal-800 transition-all disabled:opacity-50"
                  >
                    {ts.security.password.changeBtn || "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
