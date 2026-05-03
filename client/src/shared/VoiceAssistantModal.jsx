import React, { useState } from 'react';
import { Mic, MicOff, Send, X } from 'lucide-react';

export default function VoiceAssistantModal({ onClose, language, isPatient }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      text: 'Bonjour! Comment puis-je vous aider?',
      time: '10:30',
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSend = (text = input) => {
    if (!text) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        type: 'user',
        text,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          text: 'Votre prochain médicament est à 12:00. Je vais vous le rappeler.',
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    }, 1000);
  };

  const isRtl = language === 'ar' || language === 'tn';

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-3xl max-w-2xl w-full ${
          isPatient ? 'p-10' : 'p-8'
        } shadow-2xl max-h-[90vh] overflow-auto relative`}
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
            } bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <span className={isPatient ? 'text-6xl' : 'text-5xl'}>🤖</span>
          </div>
          <h2
            className={`${
              isPatient ? 'text-4xl' : 'text-3xl'
            } font-black text-slate-800 mb-2 tracking-tight`}
          >
            Assistant intelligent
          </h2>
        </div>

        <div
          className={`bg-slate-50 rounded-2xl p-6 mb-6 ${
            isPatient
              ? 'min-h-[300px] max-h-[300px]'
              : 'min-h-[400px] max-h-[400px]'
          } overflow-y-auto`}
        >
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === 'user' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
                      : 'bg-white text-slate-800 shadow-md'
                  } ${isPatient ? 'text-xl font-black' : 'text-base font-bold'}`}
                >
                  <p className="mb-1">{msg.text}</p>
                  <span
                    className={`text-[10px] font-black uppercase ${
                      msg.type === 'user'
                        ? 'text-teal-100'
                        : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`${
              isPatient ? 'p-6' : 'p-4'
            } rounded-2xl transition-all shadow-lg shadow-teal-700/20 active:scale-95 ${
              isListening
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
            }`}
          >
            {isListening ? (
              <MicOff className={isPatient ? 'w-8 h-8' : 'w-6 h-6'} />
            ) : (
              <Mic className={isPatient ? 'w-8 h-8' : 'w-6 h-6'} />
            )}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tapez votre question..."
            className={`flex-1 ${
              isPatient ? 'px-8 py-6 text-2xl' : 'px-6 py-4 text-lg'
            } bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold`}
            dir={isRtl ? 'rtl' : 'ltr'}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input}
            className={`${
              isPatient ? 'p-6' : 'p-4'
            } rounded-2xl transition-all shadow-lg active:scale-95 ${
              input
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-teal-700/20'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            <Send className={isPatient ? 'w-8 h-8' : 'w-6 h-6'} />
          </button>
        </div>
      </div>
    </div>
  );
}
