import React, { useState } from 'react';
import { Globe, Lock, Mail, Loader, Shield, Activity, Users, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import SloumaLogo from '../shared/SloumaLogo';
import { translations } from '../shared/translations';

export default function LoginScreen({ onLoginSuccess, language, setLanguage, onGoToLanding, onGoToSignup }) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const t  = (translations[language] || translations.fr);
  const ta = t.auth;
  const tc = t.common;
  const isRtl = language === 'tn' || language === 'ar';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data;
      try { const text = await response.text(); data = text ? JSON.parse(text) : {}; }
      catch { setError(ta.serverError); setLoading(false); return; }
      if (response.ok && data.token && data.role) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        onLoginSuccess(data.role, data);
      } else {
        setError(data.message || ta.wrongCredentials);
      }
    } catch (err) {
      const msg = err.message || '';
      setError(msg.includes('Failed to fetch') || msg.includes('NetworkError') ? ta.networkError : ta.wrongCredentials);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {onGoToLanding && (
        <div className="absolute top-6 left-6 lg:left-10 z-50">
          <button onClick={onGoToLanding} className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 text-slate-700 text-sm font-bold">
            <ArrowLeft className="w-4 h-4" />
            {tc.back}
          </button>
        </div>
      )}

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

      <div className="max-w-6xl w-full bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex overflow-hidden border border-slate-100 min-h-0 sm:min-h-[600px]">
        {/* Left branding panel */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-800 p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
          <div className="relative z-10">
            <SloumaLogo size={56} />
            <h1 className="text-4xl font-black mb-3 leading-tight mt-4">
              Slouma<br />
              <span className="text-teal-100 text-2xl font-medium tracking-wide">{ta.tagline}</span>
            </h1>
          </div>
          <div className="relative z-10 space-y-6">
            {[
              { icon: Activity, title: ta.feature1Title, desc: ta.feature1Desc },
              { icon: Shield,   title: ta.feature2Title, desc: ta.feature2Desc },
              { icon: Users,    title: ta.feature3Title, desc: ta.feature3Desc },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 bg-teal-400/40 rounded-xl flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5" />
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
        <div className="w-full lg:w-7/12 p-8 lg:p-16 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="lg:hidden text-center mb-10">
              <SloumaLogo size={80} className="mb-6" />
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Slouma</h1>
              <p className="text-slate-500 font-medium mt-2">{ta.tagline}</p>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">{ta.loginTitle}</h2>
              <p className="text-slate-500 font-medium mt-3">{ta.loginSubtitle}</p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-8 flex items-center gap-3">
                <Shield className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{ta.email}</label>
                <div className="relative group">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={`w-full ${isRtl ? 'pr-14 pl-4' : 'pl-14 pr-4'} py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-800`}
                    placeholder={ta.emailPlaceholder || "name@example.com"} required />
                  <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-14 flex items-center justify-center`}>
                    <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-700">{ta.password}</label>
                  <a href="#" className="flex-1 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors px-4" style={{textAlign: isRtl ? 'left' : 'right'}}>
                    {ta.forgotPwd}
                  </a>
                </div>
                <div className="relative group">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-14 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-800"
                    placeholder="••••••••" required />
                  <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-14 flex items-center justify-center`}>
                    <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} h-full w-14 flex items-center justify-center text-slate-400 hover:text-teal-500 transition-colors`}>
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl py-4 font-black text-lg shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3">
                  {loading ? (<><Loader className="w-5 h-5 animate-spin" />{ta.loggingIn}</>) : ta.loginBtn}
                </button>
              </div>
            </form>

            
            <div className="mt-8 text-center">
              <p className="text-slate-500 font-medium">
                {ta.noAccount}{' '}
                <button onClick={onGoToSignup} className="text-teal-600 font-black hover:underline underline-offset-4">{ta.signupLink}</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
