'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getSocket } from '@/lib/socket';
import { Github, User, Info, LogOut, LayoutDashboard, Flag, ShieldAlert, Zap, Menu, BarChart2, Eye, Trophy, History as HistoryIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onStartGame?: () => void;
  isConnected?: boolean;
  role?: 'w' | 'b' | 'spectator' | null;
  disconnectTimer?: number | null;
  profile?: any;
  session?: any;
  onInvite?: () => void;
  onWatch?: () => void;
  roomName?: string;
  onToggleSidebar?: () => void;
}

export function Navbar({ 
  onStartGame, isConnected = true, role, disconnectTimer, profile, session, onInvite, onWatch, roomName,
  onToggleSidebar
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const socket = getSocket();

  const isInGame = pathname.startsWith('/game/');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    router.push('/');
  };

  const handleAbort = () => {
    socket.emit('abortGame');
    setShowAbortModal(false);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-[100] bg-[#0e0e0f]/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-8 h-16">
          {/* Left: Logo & Mobile Toggle (Menu REMOVED) */}
          <div className="flex items-center gap-3">
            <Link 
              href={session ? "/lobby" : "/"} 
              className={`flex items-center gap-2 group transition-all shrink-0 ${isInGame ? 'hidden md:flex' : 'flex'}`}
            >
              <img 
                src="/assets/logo1.png" 
                alt="Blitzr Logo" 
                className="h-8 md:h-10 w-auto object-contain" 
              />
            </Link>
            {onStartGame && !isInGame && (
              <button 
                onClick={onStartGame}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-[#ba9eff] text-black font-black text-[9px] uppercase tracking-widest rounded-lg transition-all active:scale-95 shadow-lg shadow-[#ba9eff]/20"
              >
                Start Game
              </button>
            )}
          </div>
          
          {/* Center/Right: Actions */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Global Disconnect Warning */}
            {isInGame && disconnectTimer !== null && (
               <div className="flex items-center gap-3 px-4 py-1.5 bg-rose-600 rounded-lg animate-pulse shadow-lg shadow-rose-600/20 border border-rose-400/30">
                  <ShieldAlert size={14} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Forfeit in {disconnectTimer}s</span>
               </div>
            )}

            {/* Gameplay Specific Section: ONLY FOR PLAYERS */}
            {isInGame && role && role !== 'spectator' && (
              <div className="flex items-center gap-6">
                 {!disconnectTimer && (
                   <div className="flex items-center gap-3 px-4 py-1.5 bg-[#ba9eff]/10 rounded-lg border border-[#ba9eff]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ba9eff] animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ba9eff]">Battle In Progress</span>
                   </div>
                 )}
                 <button 
                   onClick={() => setShowAbortModal(true)}
                   className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest group"
                 >
                   <Flag size={12} className="group-hover:rotate-12 transition-transform" />
                   Abort Game
                 </button>
              </div>
            )}

            {/* Non-Gameplay OR Spectator: Show StartGame/GitHub/etc. */}
            {(!isInGame || role === 'spectator') && (
              <div className="flex items-center gap-3">
                {onStartGame && !isInGame && (
                  <button 
                    onClick={onStartGame}
                    className="hidden md:flex items-center gap-2 px-5 py-2 bg-[#ba9eff] text-black font-black text-[10px] uppercase tracking-widest rounded-lg transition-all hover:translate-y-[-1px] shadow-lg shadow-[#ba9eff]/5"
                  >
                    Start Game
                  </button>
                )}
                <div className="hidden md:flex items-center">
                  <a href="https://github.com/Ethan4582/Blitzr" target="_blank" className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg"><Github size={16} /></a>
                  <a href="https://ash-cv.vercel.app/" target="_blank" className="text-slate-500 hover:text-[#ba9eff] transition-all p-2 rounded-lg"><User size={16} strokeWidth={2.5} /></a>
                </div>
              </div>
            )}

            <div className="w-px h-6 bg-white/5 mx-1" />

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {session ? (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end mr-1">
                    <span className="text-[10px] font-black text-white italic uppercase tracking-tighter leading-none">{profile?.username || 'GUEST'}</span>
                    <span className="text-[9px] font-bold text-[#ba9eff] uppercase tracking-widest leading-none mt-1.5 flex items-center gap-2">
                       <span className="flex items-center gap-1 opacity-80"><Zap size={8} fill="currentColor" /> {profile?.points || 0} ELO</span>
                       {profile?.rank && <span className="w-1 h-1 rounded-full bg-white/20" />}
                       {profile?.rank && <span className="text-white/40">#{profile.rank}</span>}
                    </span>
                  </div>
                  
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden hover:border-[#ba9eff]/30 transition-all group"
                    >
                      <img
                        alt="User"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || session.user.email}`}
                      />
                    </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 8 }}
                        className="absolute right-0 mt-3 w-56 bg-[#131314] border border-white/[0.08] rounded-xl shadow-2xl p-2 z-[110] backdrop-blur-xl"
                      >
                         <div className="px-4 py-3 border-b border-white/[0.05] mb-1">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">Account</p>
                          <p className="text-sm font-bold text-white truncate">{profile?.username || session.user.email}</p>
                        </div>
                         <Link href="/lobby" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest">
                          <LayoutDashboard size={14} /> Lobby
                        </Link>
                        
                        {/* Mobile-Only Navigation Items */}
                        <div className="md:hidden contents">
                          <Link href="/analysis" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest">
                            <BarChart2 size={14} /> Analysis
                          </Link>
                          <Link href="/watch" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest">
                            <Eye size={14} /> Watch
                          </Link>
                          <Link href="/leaderboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest">
                            <Trophy size={14} /> Leaderboard
                          </Link>
                          <Link href="/history" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest">
                            <HistoryIcon size={14} /> History
                          </Link>
                        </div>

                        <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest">
                          <User size={14} /> Profile
                        </Link>
                        <div className="h-px bg-white/[0.05] my-1" />
                        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all uppercase tracking-widest">
                          <LogOut size={14} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button onClick={() => router.push('/login')} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest">Login</button>
                  <button onClick={() => router.push('/login')} className="px-5 py-2 bg-[#ba9eff] text-black font-black text-[10px] rounded-lg transition-all hover:translate-y-[-1px] shadow-lg shadow-[#ba9eff]/5 uppercase tracking-widest">Sign Up</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Abort Confirmation Modal */}
      <AnimatePresence>
        {showAbortModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAbortModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#131314] border border-white/5 rounded-2xl p-8 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                <ShieldAlert className="text-rose-500" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Abort Match?</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Ending the game now counts as a technical loss. Your opponent will be awarded the victory points.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={handleAbort} className="w-full py-3 bg-rose-500 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20">
                  Confirm Abort
                </button>
                <button onClick={() => setShowAbortModal(false)} className="w-full py-3 bg-white/[0.03] text-slate-400 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
                  Return to Battle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
