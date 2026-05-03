import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage({ onGoToLogin }) {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verify = async () => {
      try {
        const isProduction = window.location.hostname !== 'localhost';
        const baseUrl = isProduction ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');
        
        const response = await fetch(`${baseUrl}/auth/verify-email?token=${token}&email=${email}`);
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

    verify();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100">
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Loader className="w-10 h-10 animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Verifying Email...</h2>
            <p className="text-slate-500 font-medium">Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Email Verified!</h2>
            <p className="text-slate-500 font-medium">{message}</p>
            <button onClick={onGoToLogin} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-2xl py-4 font-black transition-all flex items-center justify-center gap-2">
              Go to Login <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Verification Failed</h2>
            <p className="text-rose-500 font-bold">{message}</p>
            <button onClick={onGoToLogin} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-4 font-black transition-all">
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
