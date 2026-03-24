'use client'

import { motion } from 'framer-motion';
import { LogOut, History, Eye, BarChart2, Gamepad2, ChevronLeft, ChevronRight, Trophy, Swords, User } from 'lucide-react';
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

  return (
    <nav
      className={`fixed left-0 top-16 h-[calc(100vh-64px)] flex flex-col p-4 bg-[#131314] transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-20'
      } border-r border-white/5 shadow-2xl`}
    >
      {/* Toggle Button for Open State */}
      {isOpen && (
        <div className="absolute top-6 right-4 transition-opacity duration-200">
          <button 
            onClick={onToggle}
            className="w-7 h-7 rounded-xl bg-white/[0.03] text-slate-400 flex items-center justify-center hover:bg-white/5 border border-white/10 active:scale-95 transition-all"
            title="Collapse Sidebar (Ctrl+K)"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}

      {/* Profile Section */}
      <div className={`mb-10 flex flex-col items-center ${isOpen ? 'items-start px-2' : 'items-center pt-2'}`}>
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/5 mb-4 border border-white/10 shrink-0 group hover:border-[#ba9eff]/30 transition-all shadow-xl">
          <img
            alt="Avatar"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`}
          />
        </div>
        
        {isOpen ? (
          <div className="whitespace-nowrap overflow-hidden text-left w-full group">
            <p className="text-white font-black text-sm tracking-tight truncate group-hover:text-[#ba9eff] transition-colors">{username}</p>
            <p className="text-[#ba9eff] text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <Trophy size={10} strokeWidth={3} />
              ELO {elo}
            </p>
          </div>
        ) : (
          /* Toggle Button for Closed State (Centered below avatar) */
          <button 
            onClick={onToggle}
            className="mt-2 w-8 h-8 rounded-full bg-[#ba9eff] text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-[#ba9eff]/20 border-4 border-[#131314]"
            title="Expand Sidebar (Ctrl+K)"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Navigation items */}
      <div className="flex flex-col gap-2 flex-grow overflow-x-hidden pt-6 border-t border-white/5">
        <Link href="/dashboard" className={`flex items-center gap-4 p-3 bg-white/[0.03] text-white rounded-xl transition-all hover:bg-white/5 border border-white/5 hover:border-white/10 shadow-sm ${isOpen ? 'px-4' : 'justify-center'}`}>
          <Swords size={20} className={isOpen ? 'text-[#ba9eff]' : 'text-white'} />
          {isOpen && <span className="font-headline text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap hidden md:block">Play</span>}
        </Link>
        <button className={`flex items-center gap-4 p-3 text-slate-500 hover:bg-white/5 hover:text-white rounded-xl transition-all ${isOpen ? 'px-4' : 'justify-center'}`}>
          <BarChart2 size={20} strokeWidth={2.5} />
          {isOpen && <span className="font-headline text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap hidden md:block">Analysis</span>}
        </button>
        <button className={`flex items-center gap-4 p-3 text-slate-500 hover:bg-white/5 hover:text-white rounded-xl transition-all ${isOpen ? 'px-4' : 'justify-center'}`}>
          <Eye size={20} strokeWidth={2.5} />
          {isOpen && <span className="font-headline text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap hidden md:block">Watch</span>}
        </button>
        <button className={`flex items-center gap-4 p-3 text-slate-500 hover:bg-white/5 hover:text-white rounded-xl transition-all ${isOpen ? 'px-4' : 'justify-center'}`}>
          <History size={20} strokeWidth={2.5} />
          {isOpen && <span className="font-headline text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap hidden md:block">History</span>}
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-2 overflow-x-hidden pt-4 border-t border-white/5">
        <button onClick={handleLogout} className={`flex items-center gap-4 p-3 text-slate-500 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all ${isOpen ? 'px-4' : 'justify-center'}`}>
          <LogOut size={20} strokeWidth={2.5} />
          {isOpen && <span className="font-headline text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap hidden md:block">Logout</span>}
        </button>
      </div>
    </nav>
  );
}
