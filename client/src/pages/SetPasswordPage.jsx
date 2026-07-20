import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, XCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../services/api';

export default function SetPasswordPage({ onGoToLogin }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('form');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('email') || '';
    const t = params.get('token') || '';
    if (!e || !t) {
      setStatus('error');
      setMessage('Invalid invitation link. Please contact your admin.');
      return;
    }
    setEmail(e);
    setToken(t);
  }, []);

  const validate = () => {
    const errs = {};
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])/.test(password)) errs.password = 'Must contain a lowercase letter';
    else if (!/(?=.*[A-Z])/.test(password)) errs.password = 'Must contain an uppercase letter';
    else if (!/(?=.*\d)/.test(password)) errs.password = 'Must contain a number';
    else if (!/(?=.*[@$!%*?&#])/.test(password)) errs.password = 'Must contain a special character (@$!%*?&#)';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch(`${API_URL}/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Connection error. Please try again later.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100">
          <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mt-6">Password Set!</h2>
          <p className="text-slate-500 font-medium mt-2">{message}</p>
          <button onClick={onGoToLogin} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-2xl py-4 font-black transition-all flex items-center justify-center gap-2 mt-6">
            Go to Login <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <XCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mt-6">Invalid Link</h2>
          <p className="text-rose-500 font-bold mt-2">{message}</p>
          <button onClick={onGoToLogin} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-4 font-black transition-all mt-6">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 text-center mt-6">Set Your Password</h2>
        <p className="text-slate-500 text-center font-medium mt-1">Create a strong password for your account</p>
        <p className="text-teal-600 text-center text-sm font-bold mt-2">{email}</p>

        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold text-slate-700 pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-rose-500 text-xs font-bold mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold text-slate-700"
            />
            {errors.confirmPassword && <p className="text-rose-500 text-xs font-bold mt-1">{errors.confirmPassword}</p>}
          </div>

          <p className="text-[10px] text-slate-400 font-medium px-1 leading-relaxed">
            Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&#).
          </p>

          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-2xl py-4 font-black transition-all">
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
}
