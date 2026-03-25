'use client'

import React from 'react';
import { Gamepad2, BarChart2, Eye, Trophy, History, LogOut, Zap, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface MobileProfileNavProps {
  profile: any;
}

export function MobileProfileNav({ profile }: MobileProfileNavProps) {
  const pathname = usePathname();
  const username = profile?.username || 'Guest';
  const elo = profile?.points || 1000;

  const navItems = [
    { label: 'Lobby', icon: Gamepad2, href: '/lobby' },
    { label: 'Analysis', icon: BarChart2, href: '/analysis' },
    { label: 'Watch', icon: Eye, href: '/watch' },
    { label: 'Rank', icon: Trophy, href: '/leaderboard' },
    { label: 'History', icon: History, href: '/history' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="md:hidden w-full space-y-4 mb-8">
      {/* Profile Info Row (Mobile Sidebar content) */}
      <div className="flex items-center justify-between bg-[#131314] p-4 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
             <img
               alt="Avatar"
               className="w-full h-full object-cover"
               src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`}
             />
          </div>
          <div>
            <p className="text-white font-black text-sm tracking-tight">{username}</p>
            <p className="text-[#ba9eff] text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
               <Zap size={10} fill="currentColor" />
               ELO {elo}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 active:scale-95 transition-all"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Navigation Grid (Mobile Sidebar content) */}
      <div className="grid grid-cols-5 gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-1.5 ${
                isActive 
                  ? 'bg-[#ba9eff]/10 border-[#ba9eff]/30 text-[#ba9eff]' 
                  : 'bg-[#131314] border-white/5 text-slate-500'
              }`}
            >
              <item.icon size={18} strokeWidth={isActive ? 3 : 2.5} />
              <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
