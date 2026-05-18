import React, { useState } from 'react';
import { Globe, Lock, Mail, Loader, Shield, Activity, Users, ArrowLeft, Eye, EyeOff, User, CheckCircle2, Stethoscope, HeartPulse, Phone, MapPin, Calendar, Droplets } from 'lucide-react';
import SloumaLogo from '../shared/SloumaLogo';
import { translations } from '../shared/translations';

const MOCK_DOCTORS = [
  { id: 'DOC001', name: 'Dr. Ahmed Ben Salem', treats: 'heartDisease', patientCount: 12 },
  { id: 'DOC002', name: 'Dr. Sarah Mansouri', treats: 'diabetes', patientCount: 8 },
  { id: 'DOC003', name: 'Dr. Karim Trabelsi', treats: 'hypertension', patientCount: 15 },
  { id: 'DOC004', name: 'Dr. Leila Jabeur', treats: 'other', patientCount: 5 },
];

export default function SignupScreen({ language, setLanguage, onGoToLogin, onGoToLanding }) {
  const [step, setStep] = useState(1);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('patient');
  
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [dateOfBirth, setDateOfBirth] = useState('1970-01-01');
  const [caregiverId, setCaregiverId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [selectedConditions, setSelectedConditions] = useState(['heartDisease']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assignedDoctor, setAssignedDoctor] = useState(null);

  const t  = (translations[language] || translations.fr);
  const ta = t.auth;
  const tc = t.common;
  const isRtl = language === 'tn' || language === 'ar';

  const conditionItems = [
    { key: 'heartDisease', label: ta.heartDisease },
    { key: 'diabetes',     label: ta.diabetes },
    { key: 'hypertension', label: ta.hypertension },
    { key: 'other',        label: ta.other },
  ];

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

  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [devOtpCode, setDevOtpCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleNext = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError(ta.passwordMismatch); return; }
    if (!validatePassword(password)) { 
      setError("Password does not meet the security requirements."); 
      return; 
    }
    setError('');
    setStep(2);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    let assignedDoc = null;
    if (role === 'patient') {
      const primaryCondition = selectedConditions[0] || 'heartDisease';
      const specialists = MOCK_DOCTORS.filter(d => d.treats === primaryCondition);
      if (specialists.length === 0) { setError(ta.noSpecialist); return; }
      assignedDoc = specialists.reduce((min, doc) => (doc.patientCount < min.patientCount ? doc : min), specialists[0]);
      setAssignedDoctor(assignedDoc);
    } else if (role === 'caregiver') {
      if (!patientId) { setError(ta.patientIdRequired); return; }
    }

    setLoading(true);
    try {
      const isProduction = window.location.hostname !== 'localhost';
      const baseUrl = isProduction ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');
      
      const signupData = {
        name,
        lastname,
        email: email.toLowerCase(),
        password,
        role,
        phone,
        address,
        id: role === 'patient' ? `PAT${Date.now()}` : `CG${Date.now()}`,
        ...(role === 'patient' && { 
            doctorIDs: assignedDoc ? [assignedDoc.id] : [], 
            currentConditions: selectedConditions, 
            bloodGroup, 
            dateOfBirth, 
            gender,
            caregiverIDs: caregiverId ? [caregiverId] : []
        }),
        ...(role === 'caregiver' && { patientIDs: [patientId] }),
      };

      const response = await fetch(`${baseUrl}/auth/register`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(signupData) 
      });
      
      const data = await response.json();
      if (response.ok) { 
          if (data.devCode) {
              setDevOtpCode(data.devCode);
          } else {
              setDevOtpCode('');
          }
          if (data.previewUrl) {
              setPreviewUrl(data.previewUrl);
          } else {
              setPreviewUrl('');
          }
          setIsVerifying(true); 
      } else { 
          setError(data.message || ta.signupError); 
      }
    } catch { 
        setError(ta.signupError); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setVerificationError('');
    setLoading(true);

    try {
      const isProduction = window.location.hostname !== 'localhost';
      const baseUrl = isProduction ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');

      const response = await fetch(`${baseUrl}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), code: otpCode })
      });

      const data = await response.json();
      if (response.ok) {
        setIsSubmitted(true);
        setIsVerifying(false);
      } else {
        setVerificationError(data.message || ta.invalidCode);
      }
    } catch {
      setVerificationError(ta.signupError);
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
          <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3">
            <Shield className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 text-center mb-3">{ta.verificationCode}</h2>
          <p className="text-slate-500 font-bold text-center mb-8">{ta.enterCode}</p>

          {devOtpCode && (
            <div className="mb-8 p-6 bg-teal-50/50 border border-teal-100/80 rounded-3xl text-center shadow-sm relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl" />
              <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest block mb-2 font-mono">
                🔧 SANDBOX MODE ACTIVE
              </span>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                Email service is not configured or failed to send. For testing/demo purposes, please use the following code:
              </p>
              <div className="flex flex-col items-center justify-center gap-3">
                <span className="font-mono text-3xl font-black text-teal-600 bg-white border border-teal-200/60 rounded-2xl py-3 px-6 shadow-inner tracking-widest">
                  {devOtpCode}
                </span>

                {previewUrl && (
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    ✉️ View Sent Email Inbox
                  </a>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <input 
                type="text" 
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center text-4xl font-black tracking-[1rem] py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all text-teal-600 placeholder:text-slate-200"
                placeholder="000000"
                required
              />
            </div>

            {verificationError && (
              <p className="text-rose-500 text-center text-sm font-bold animate-shake">{verificationError}</p>
            )}

            <button 
              type="submit" 
              disabled={loading || otpCode.length < 6}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl py-4 font-black text-lg shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : ta.verify}
            </button>

            <div className="text-center">
              <button 
                type="button" 
                onClick={() => setIsVerifying(false)}
                className="text-slate-400 font-black text-xs hover:text-slate-600 transition-colors uppercase tracking-widest"
              >
                {ta.back}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100">
          <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">{ta.signupSuccess}</h2>
          {assignedDoctor && (
            <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-start">
              <p className="text-xs font-black text-teal-600 uppercase tracking-widest mb-3">{ta.assignedDoctor}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-slate-800">{assignedDoctor.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 font-mono tracking-tight">{assignedDoctor.id}</p>
                </div>
              </div>
            </div>
          )}
          <p className="text-slate-500 font-medium leading-relaxed mb-10">{ta.pendingApproval}</p>
          <button onClick={onGoToLanding} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-4 font-black transition-all">{tc.back}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`absolute top-6 ${isRtl ? 'right-6 lg:right-10' : 'left-6 lg:left-10'} z-50 flex gap-2`}>
        {onGoToLanding && (
          <button onClick={onGoToLanding} className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 text-slate-700 text-sm font-bold">
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />{tc.back}
          </button>
        )}
      </div>

      {/* Language Selector */}
      <div className="absolute top-6 right-6 lg:right-10 z-50">
        <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200">
          <Globe className="w-5 h-5 text-teal-600" />
          <span className="text-sm font-bold text-slate-700">{tc.langLabel[language]}</span>
        </button>
        {showLanguageMenu && (
          <div className="absolute top-16 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 min-w-[180px] origin-top-right animate-in fade-in zoom-in duration-200">
            {tc.langOptions.map((l) => (
              <button key={l.code} onClick={() => { setLanguage(l.code); setShowLanguageMenu(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm ${language === l.code ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                {l.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-6xl w-full bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex overflow-hidden border border-slate-100 min-h-0 sm:min-h-[850px]">
        {/* Left branding */}
        <div className="hidden lg:flex lg:w-4/12 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
          <div className="relative z-10">
            <SloumaLogo size={56} />
            <h1 className="text-4xl font-black mb-3 leading-tight mt-4">
              Slouma<br />
              <span className="text-teal-100 text-2xl font-medium tracking-wide">{ta.tagline}</span>
            </h1>
          </div>
          <div className="relative z-10 space-y-4">
            {[
              { title: ta.feature1Title, desc: ta.feature1Desc },
              { title: ta.feature2Title, desc: ta.feature2Desc },
              { title: ta.feature3Title, desc: ta.feature3Desc },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 bg-teal-400/40 rounded-xl flex items-center justify-center shrink-0">
                  {i === 0 ? <Activity className="w-5 h-5" /> : i === 1 ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{f.title}</h3>
                  <p className="text-teal-100 text-sm mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="w-full lg:w-8/12 p-8 lg:p-12 flex flex-col justify-center overflow-y-auto">
          <div className="max-w-xl w-full mx-auto">
            <div className="mb-8 text-center lg:text-left flex items-center justify-between">
              <div>
                <h2 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">{ta.signupTitle}</h2>
                <p className="text-slate-500 font-medium mt-3">{ta.signupSubtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-teal-600 uppercase tracking-widest">{tc.step || 'Step'} {step}/2</p>
                <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${(step/2)*100}%` }}></div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 flex items-center gap-3">
                <Shield className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleNext} className="space-y-6">
                {/* Role */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">{ta.chooseRole}</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'patient', icon: HeartPulse, label: tc.roles.patient },
                      { id: 'caregiver', icon: Users, label: tc.roles.caregiver },
                    ].map((r) => (
                      <button key={r.id} type="button" onClick={() => setRole(r.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${role === r.id ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                        <r.icon className={`w-6 h-6 ${role === r.id ? 'text-teal-600' : 'text-slate-300'}`} />
                        <span className="text-sm font-black uppercase tracking-wider">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{ta.name} (First Name)</label>
                    <div className="relative group">
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-800`}
                        placeholder="John" required />
                      <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-12 flex items-center justify-center`}>
                        <User className="w-5 h-5 text-slate-400 group-focus-within:text-teal-500" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{ta.email}</label>
                    <div className="relative group">
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-800`}
                        placeholder="name@example.com" required />
                      <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-12 flex items-center justify-center`}>
                        <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-teal-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { val: password, set: setPassword, show: showPassword, setShow: setShowPassword, label: ta.password, isMain: true },
                    { val: confirmPassword, set: setConfirmPassword, show: showConfirmPassword, setShow: setShowConfirmPassword, label: ta.confirmPassword, isMain: false },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{f.label}</label>
                      <div className="relative group">
                        <input type={f.show ? 'text' : 'password'} value={f.val} onChange={(e) => f.set(e.target.value)}
                          className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} pr-4 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-800`}
                          required />
                        <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-12 flex items-center justify-center`}>
                          <Lock className="w-5 h-5 text-slate-400" />
                        </div>
                        <button type="button" onClick={() => f.setShow(!f.show)}
                          className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} h-full w-12 flex items-center justify-center text-slate-400 hover:text-teal-500`}>
                          {f.show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                      {f.isMain && password && (
                        <div className="mt-3 space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          {passwordRequirements.map((req, idx) => {
                            const isMet = req.regex.test(password);
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
                  ))}
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl py-4 font-black text-lg shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3">
                    {tc.next} <ArrowLeft className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-6">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-teal-600 font-black text-sm mb-4">
                    <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {ta.back}
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{ta.lastname}</label>
                    <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 outline-none transition-all font-medium"
                      placeholder="Doe" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{ta.phone}</label>
                    <div className="relative group">
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 outline-none transition-all font-medium`}
                        placeholder="55 123 456" required pattern="^[0-9]{8}$" maxLength="8" title="Veuillez entrer un numéro de téléphone tunisien valide (8 chiffres)" />
                      <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-12 flex items-center justify-center`}>
                        <Phone className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">{ta.dateOfBirth}</label>
                        <div className="relative">
                            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 outline-none transition-all font-medium"
                                required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">{ta.gender}</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 outline-none transition-all font-medium appearance-none">
                            <option value="Male">{ta.male}</option>
                            <option value="Female">{ta.female}</option>
                            <option value="Other">{ta.other}</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{ta.address}</label>
                    <div className="relative group">
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                            className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 outline-none transition-all font-medium`}
                            placeholder="Rue de la liberté, Tunis" required />
                        <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-12 flex items-center justify-center`}>
                            <MapPin className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                </div>

                {role === 'patient' ? (
                   <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-teal-800 mb-1">{ta.bloodGroup}</label>
                                <div className="relative group">
                                    <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-teal-50 border border-teal-100 rounded-2xl focus:bg-white focus:border-teal-500 outline-none transition-all font-medium appearance-none text-teal-900">
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                    <div className={`absolute top-0 ${isRtl ? 'left-4' : 'right-4'} h-full flex items-center pointer-events-none`}>
                                        <Droplets className="w-5 h-5 text-teal-400" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-teal-800 mb-1">{ta.caregiverId}</label>
                                <input type="text" value={caregiverId} onChange={(e) => setCaregiverId(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-teal-50 border border-teal-100 rounded-2xl focus:bg-white focus:border-teal-500 outline-none transition-all font-medium text-teal-900"
                                    placeholder="CG123" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-teal-800 mb-2">{ta.conditions}</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {conditionItems.map(({ key, label }) => {
                                    const isSel = selectedConditions.includes(key);
                                    return (
                                        <button key={key} type="button"
                                            onClick={() => { if (isSel) { if (selectedConditions.length > 1) setSelectedConditions(selectedConditions.filter(c => c !== key)); } else { setSelectedConditions([...selectedConditions, key]); } }}
                                            className={`py-2 px-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-tight transition-all ${isSel ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-white border-teal-100 text-teal-600 hover:border-teal-300'}`}>
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                   </div>
                ) : (
                    <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
                        <label className="block text-sm font-bold text-amber-800 mb-1">{ta.patientId}</label>
                        <div className="relative group">
                            <input type="text" value={patientId} onChange={(e) => setPatientId(e.target.value)}
                                className="w-full px-5 py-3.5 bg-white border border-amber-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-amber-900"
                                placeholder="PAT789" required />
                        </div>
                        <p className="text-[10px] text-amber-600 mt-2 px-1 font-bold italic">{ta.patientIdHint}</p>
                    </div>
                )}

                <div className="pt-4">
                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl py-4 font-black text-lg shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-3">
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : ta.signupBtn}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-slate-500 font-medium">
                {ta.hasAccount}{' '}
                <button onClick={onGoToLogin} className="text-teal-600 font-black hover:underline underline-offset-4">{ta.loginLink}</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

