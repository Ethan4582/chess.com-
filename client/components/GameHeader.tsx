'use client'

import { Github, User, PlusCircle } from 'lucide-react';
import Link from 'next/link';

interface GameHeaderProps {
  onStartGame: () => void;
  isConnected: boolean;
}

export function GameHeader({ onStartGame, isConnected }: GameHeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-[#0e0e0f] border-b border-white/[0.05] backdrop-blur-md">
      <div className="flex items-center gap-6">
        <Link 
          href="/dashboard"
          className="text-2xl font-black tracking-tighter text-white font-headline flex items-center group transition-all"
        >
          <span className="text-[#ba9eff] group-hover:mr-2 transition-all">Obsidian</span>
          <span className="opacity-0 group-hover:opacity-100 transition-all text-[#ba9eff]">Gambit</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#ba9eff] ml-2 group-hover:scale-150 transition-all shadow-[0_0_10px_#ba9eff]" />
        </Link>
      </div>
      
      <div className="flex items-center gap-6">
        {!isConnected && (
          <span className="text-red-500 flex items-center gap-2 text-[10px] uppercase tracking-widest font-black bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            Disconnected
          </span>
        )}
        
        <div className="flex items-center gap-3">
          {/* Start Game Button (Desktop/Mobile hybrid) */}
          <button 
            onClick={onStartGame}
            className="flex items-center gap-2.5 px-6 py-2.5 bg-[#ba9eff] text-black font-black text-xs uppercase tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#ba9eff]/10 hover:shadow-[#ba9eff]/20"
          >
            <PlusCircle size={14} strokeWidth={3} />
            <span className="hidden md:block">Start Game</span>
            <span className="md:hidden">Play</span>
          </button>

          <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />

          <a 
            href="https://github.com/ashirwad" 
            target="_blank"
            className="text-slate-500 hover:text-white transition-colors p-2.5 bg-white/5 rounded-full hover:border-[#ba9eff]/30 border border-transparent" 
            title="GitHub"
          >
            <Github size={18} />
          </a>
          <button className="text-slate-500 hover:text-white transition-colors p-2.5 bg-white/5 rounded-full hover:border-[#ba9eff]/30 border border-transparent">
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
