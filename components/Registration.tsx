
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface RegistrationProps {
  onComplete: (user: UserProfile) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onComplete }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;
    onComplete({ firstName, lastName, email });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-8 py-12">
      <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 blue-glow rotate-12">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-black mb-2">ParaYon'a Hoş Geldiniz</h1>
        <p className="text-slate-500 text-sm">Finansal yolculuğunuza başlamak için bilgilerinizi kaydedin.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 ml-1">Adınız</label>
            <input 
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none transition-all font-semibold"
              placeholder="Örn: Can"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 ml-1">Soyadınız</label>
            <input 
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none transition-all font-semibold"
              placeholder="Örn: Yılmaz"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 ml-1">E-Posta Adresiniz</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none transition-all font-semibold"
              placeholder="can@example.com"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-3xl font-black text-lg text-white shadow-2xl shadow-blue-600/30 transition-all active:scale-95 mt-4"
        >
          Hadi Başlayalım
        </button>
      </form>
    </div>
  );
};

export default Registration;
