'use client'

import { motion } from 'framer-motion';
import { LogOut, History, Eye, BarChart2, Gamepad2, ChevronLeft, ChevronRight, Trophy, Swords } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  profile: any;
}

export function LeftSidebar({ isOpen, onToggle, profile }: LeftSidebarProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const username = profile?.username || 'Grandmaster';
  const elo = profile?.points || 1200;
  const wins = profile?.wins || 0;
  const losses = profile?.losses || 0;
  const draws = profile?.draws || 0;

  return (
    <nav
      className={`fixed left-0 top-16 h-[calc(100vh-64px)] flex flex-col p-4 bg-[#131314] transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-20'
      } border-r border-white/5 shadow-2xl overflow-visible`}
    >
      {/* Dynamic Toggle Button inside Sidebar */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#ba9eff] text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg z-50 ring-4 ring-[#131314]"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Profile Section */}
      <div className={`mb-8 flex flex-col items-center ${isOpen ? 'xl:items-start xl:px-4' : 'items-center'}`}>
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/5 mb-3 border border-white/10 shrink-0 group hover:border-[#ba9eff]/50 transition-colors">
          <img
            alt="Avatar"
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`}
          />
        </div>
        {isOpen && (
          <div className="whitespace-nowrap overflow-hidden text-left w-full group">
            <p className="text-white font-black text-sm tracking-tight truncate group-hover:text-[#ba9eff] transition-colors">{username}</p>
            <p className="text-[#ba9eff] text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <Trophy size={10} />
              Elo {elo}
            </p>
            
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 win-text">W</span>
                <span className="text-xs font-black text-emerald-400">{wins}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 loss-text">L</span>
                <span className="text-xs font-black text-rose-500">{losses}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 draw-text">D</span>
                <span className="text-xs font-black text-slate-400">{draws}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-grow overflow-x-hidden pt-4 border-t border-white/5">
        <Link href="/dashboard" className={`flex items-center gap-4 p-3 bg-white/[0.03] text-white rounded-xl transition-all hover:bg-white/5 border border-white/5 hover:border-white/10 ${isOpen ? 'px-4' : 'justify-center'}`}>
          <Swords size={20} className={isOpen ? 'text-[#ba9eff]' : 'text-white'} />
          {isOpen && <span className="font-headline text-xs font-black uppercase tracking-widest whitespace-nowrap hidden md:block">Play</span>}
        </Link>
        <button className={`flex items-center gap-4 p-3 text-slate-500 hover:bg-white/5 hover:text-white rounded-xl transition-all ${isOpen ? 'px-4' : 'justify-center'}`}>
          <BarChart2 size={20} />
          {isOpen && <span className="font-headline text-xs font-black uppercase tracking-widest whitespace-nowrap hidden md:block">Analysis</span>}
        </button>
        <button className={`flex items-center gap-4 p-3 text-slate-500 hover:bg-white/5 hover:text-white rounded-xl transition-all ${isOpen ? 'px-4' : 'justify-center'}`}>
          <Eye size={20} />
          {isOpen && <span className="font-headline text-xs font-black uppercase tracking-widest whitespace-nowrap hidden md:block">Watch</span>}
        </button>
        <button className={`flex items-center gap-4 p-3 text-slate-500 hover:bg-white/5 hover:text-white rounded-xl transition-all ${isOpen ? 'px-4' : 'justify-center'}`}>
          <History size={20} />
          {isOpen && <span className="font-headline text-xs font-black uppercase tracking-widest whitespace-nowrap hidden md:block">History</span>}
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-2 overflow-x-hidden pt-4 border-t border-white/5">
        <button onClick={handleLogout} className={`flex items-center gap-4 p-3 text-slate-500 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all ${isOpen ? 'px-4' : 'justify-center'}`}>
          <LogOut size={20} />
          {isOpen && <span className="font-headline text-xs font-black uppercase tracking-widest whitespace-nowrap hidden md:block">Logout</span>}
        </button>
      </div>
    </nav>
  );
}
