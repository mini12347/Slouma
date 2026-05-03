import React from 'react';

export default function SloumaLogo({ size = 40, className = '', withText = false, textClass = '' }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="48" height="48" rx="14" fill="#14B8A6" />

        <polyline
          points="8,26 16,26 19,18 24,34 29,14 32,26 40,26"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {withText && (
        <span className={textClass || 'text-2xl font-black text-slate-800 tracking-tight'}>
          Slouma
        </span>
      )}
    </span>
  );
}
