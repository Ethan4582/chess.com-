'use client'

import { motion } from 'framer-motion';
import { LogOut, History, Eye, BarChart2, Gamepad2, ChevronLeft, ChevronRight, Trophy, Swords, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  profile: any;
}

export function LeftSidebar({ isOpen, onToggle, profile }: LeftSidebarProps) {
  const pathname = usePathname();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const username = profile?.username || 'Guest';
  const elo = profile?.points || 1000;

  const navItems = [
    { label: 'Play', icon: Gamepad2, href: '/dashboard' },
    { label: 'Analysis', icon: BarChart2, href: '/analysis' },
    { label: 'Watch', icon: Eye, href: '/watch' },
    { label: 'History', icon: History, href: '/history' },
  ];

  return (
    <nav
      className={`h-full flex flex-col p-4 bg-[#131314] transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-20'
      } border-r border-white/5 shadow-2xl relative shrink-0 overflow-hidden`}
    >
      {/* Toggle Button for Open State */}
      {isOpen && (
        <div className="absolute top-6 right-4 transition-opacity duration-200">
          <button 
            onClick={onToggle}
            className="w-7 h-7 rounded-xl bg-white/[0.03] text-slate-400 flex items-center justify-center hover:bg-white/5 border border-white/10 active:scale-95 transition-all"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}

      {/* Profile Section */}
      <div className={`mb-10 flex flex-col items-center ${isOpen ? 'items-start px-2' : 'items-center pt-2'}`}>
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 mb-4 border border-white/10 shrink-0 group hover:border-[#ba9eff]/30 transition-all shadow-xl">
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
          /* Toggle Button for Closed State */
          <button 
            onClick={onToggle}
            className="mt-2 w-8 h-8 rounded-lg bg-[#ba9eff] text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-[#ba9eff]/20 border-4 border-[#131314]"
            title="Expand Sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Navigation items */}
      <div className="flex flex-col gap-1.5 flex-grow overflow-x-hidden pt-6 border-t border-white/5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label}
              href={item.href} 
              className={`flex items-center gap-4 p-3 rounded-lg transition-all border ${
                isActive 
                  ? 'bg-white/[0.05] text-[#ba9eff] border-white/10 shadow-sm shadow-black/20' 
                  : 'text-slate-500 hover:bg-white/[0.02] hover:text-white border-transparent hover:border-white/5'
              } ${isOpen ? 'px-4' : 'justify-center'}`}
            >
              <item.icon size={18} strokeWidth={isActive ? 3 : 2.5} />
              {isOpen && (
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap hidden md:block transition-all ${
                  isActive ? 'text-white' : ''
                }`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2 overflow-x-hidden pt-4 border-t border-white/5">
        <button 
          onClick={handleLogout} 
          className={`flex items-center gap-4 p-3 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-all ${isOpen ? 'px-4' : 'justify-center'}`}
        >
          <LogOut size={18} strokeWidth={2.5} />
          {isOpen && <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap hidden md:block">Logout</span>}
        </button>
      </div>
    </nav>
  );
}
