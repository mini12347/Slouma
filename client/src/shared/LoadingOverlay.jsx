import React from 'react';
import { Loader2 } from 'lucide-react';
import SloumaLogo from './SloumaLogo';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white animate-in fade-in duration-500">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 opacity-60" />
      
      <div className="relative flex flex-col items-center">
        <div className="relative mb-8">
          <SloumaLogo size={100} className="animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Loader2 className="w-20 h-20 text-teal-600/20 animate-spin" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Chargement...</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Slouma Santé Digital</p>
        
        <div className="mt-12 flex space-x-2">
          <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-3 h-3 bg-teal-300 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
