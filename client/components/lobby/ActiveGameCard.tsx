'use client'

import React from 'react';
import { Swords, Play, Gamepad2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ActiveGame {
  id: string;
  opponent: string;
  status: string;
}

interface ActiveGameCardProps {
  activeRoom: ActiveGame | null;
  loading: boolean;
}

export function ActiveGameCard({ activeRoom, loading }: ActiveGameCardProps) {
  if (loading) {
     return <div className="h-40 w-full bg-[#131314] rounded-[2rem] border border-white/5 animate-pulse" />;
  }

  if (!activeRoom) return null;

  return (
    <motion.div 
       initial={{ opacity: 0, scale: 0.98 }}
       animate={{ opacity: 1, scale: 1 }}
       className="relative h-40 rounded-[2rem] bg-gradient-to-br from-[#1a1a1b] to-[#131314] border border-[#ba9eff]/30 p-8 flex flex-col justify-between overflow-hidden shadow-2xl group transition-all hover:border-[#ba9eff]/60"
    >
       <div className="absolute top-0 right-0 w-32 h-32 bg-[#ba9eff]/5 rounded-bl-full opacity-20 group-hover:opacity-40 transition-all pointer-events-none" />
       
       <div className="flex justify-between items-start">
          <div className="space-y-1">
             <span className="text-[10px] font-black text-[#ba9eff] uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Engagement
             </span>
             <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase tabular-nums truncate max-w-sm">
                Vs {activeRoom.opponent || 'Ghost Rival'}
             </h2>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#ba9eff]/10 flex items-center justify-center border border-[#ba9eff]/20 text-[#ba9eff] group-hover:scale-110 transition-transform duration-700">
             <Zap size={28} fill="currentColor" />
          </div>
       </div>

       <div className="flex items-center gap-6">
          <Link 
            href={`/game/${activeRoom.id}`}
            className="px-8 py-2.5 bg-[#ba9eff] text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#ba9eff]/10 flex items-center gap-3 z-10"
          >
            <Play size={12} fill="currentColor" />
            Resume Battle
          </Link>
          <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none">
            Tactical Code: <span className="text-white ml-2 tabular-nums">{activeRoom.id.slice(0, 8)}</span>
          </div>
       </div>
    </motion.div>
  );
}
