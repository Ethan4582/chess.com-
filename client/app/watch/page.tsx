'use client'

import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Eye } from 'lucide-react';

export default function WatchPlaceholder() {
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0b] p-8">
        <div className="text-center space-y-6 max-w-sm">
           <div className="w-20 h-20 bg-[#ba9eff]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#ba9eff]/20 animate-pulse">
              <Eye className="text-[#ba9eff]" size={40} />
           </div>
           <div className="space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Spectate Mode</h1>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                 Watching top-tier elite games is the ultimate way to learn. Feature coming soon.
              </p>
           </div>
           <button 
             onClick={() => window.location.href = '/dashboard'}
             className="px-6 py-2.5 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#ba9eff] hover:bg-[#ba9eff]/10 transition-all"
           >
             Return to Lobby
           </button>
        </div>
      </div>
    </AppLayout>
  );
}
