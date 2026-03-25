import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BarChart2, Eye, Trophy, History, X, Globe, User } from 'lucide-react';
import Link from 'next/link';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
}

export function SidebarDrawer({ isOpen, onClose, playerName }: SidebarDrawerProps) {
  const menuItems = [
    { label: 'Lobby', icon: Home, href: '/lobby' },
    { label: 'Analysis', icon: BarChart2, href: '/history' }, // Or direct to results?
    { label: 'Watch Center', icon: Eye, href: '/watch' },
    { label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
    { label: 'Battle History', icon: History, href: '/history' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[80] backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 bottom-0 z-[90] w-[280px] bg-[#0e0e0f] border-r border-white/5 flex flex-col shadow-2xl md:hidden"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#ba9eff]/20 flex items-center justify-center border border-[#ba9eff]/20">
               <Globe className="text-[#ba9eff] animate-spin-slow" size={24} />
             </div>
             <div className="flex flex-col">
               <span className="text-xl font-black tracking-tighter text-white font-headline">Navigation</span>
               <span className="text-[10px] font-black text-[#ba9eff] uppercase tracking-widest opacity-60">Arena Explorer</span>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-500">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-3 mt-6">
          {menuItems.map((item, idx) => (
            <Link 
              key={idx}
              href={item.href}
              className="flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-[#ba9eff]/5 text-slate-400 hover:text-[#ba9eff] transition-all group border border-transparent hover:border-[#ba9eff]/10"
              onClick={onClose}
            >
              <item.icon size={22} className="group-hover:scale-110 transition-transform" />
              <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
             <div className="w-10 h-10 rounded-xl bg-[#ba9eff]/10 flex items-center justify-center border border-[#ba9eff]/20 text-[#ba9eff] shrink-0 font-black">
               {playerName[0].toUpperCase()}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-black text-white truncate">{playerName}</p>
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Player</span>
             </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
