'use client'

import React from 'react';
import { Swords, Eye, TrendingUp, Play, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface LobbyHeroProps {
  onStartGame: () => void;
  username: string;
}

export function LobbyHero({ onStartGame, username }: LobbyHeroProps) {
  return (
    <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-[2rem] bg-[#131314]">
      
      <img 
        src="/assets/lobby_bg.png" 
        alt="Lobby Background" 
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      
      
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent md:hidden" />

      <div className="relative h-full flex flex-col justify-center px-6 md:px-10 max-w-2xl">
        <motion.span 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#ba9eff] font-black uppercase tracking-[0.3em] text-[10px] mb-4"
        >
          Tactical Nexus
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6 leading-none italic uppercase"
        >
          Initialize Command
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 mb-8 text-sm md:text-base leading-relaxed max-w-md font-medium"
        >
          The board is set. Challenge the engine or enter the arena against 4,209 active grandmasters worldwide.
        </motion.p>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={onStartGame}
            className="px-8 py-3 bg-gradient-to-r from-[#8553f3] to-[#ba9eff] text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-[#ba9eff]/10 hover:scale-105 active:scale-95 transition-all"
          >
            Quick Match
          </button>
          <button className="px-8 py-3 bg-white/[0.03] text-white font-black text-xs uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
            Custom Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
