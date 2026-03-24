'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Github, User, Info, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onStartGame?: () => void;
  isConnected?: boolean;
}

export function Navbar({ onStartGame, isConnected = true }: NavbarProps) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    router.push('/');
  };

  return (
    <header className="fixed top-0 w-full z-[100] bg-[#0e0e0f]/80 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-8 h-16">
        {/* Left: Logo */}
        <Link 
          href={session ? "/dashboard" : "/"} 
          className="flex items-center gap-2 group transition-all"
        >
          <img 
            src="/assets/logo1.png" 
            alt="Blitzr Logo" 
            className="h-8 md:h-10 w-auto object-contain" 
          />
        </Link>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-5">
          {/* Connection status (minimal) */}
          {onStartGame && !isConnected && (
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" title="Disconnected" />
          )}

          <div className="flex items-center gap-4">
            {onStartGame && (
              <button 
                onClick={onStartGame}
                className="flex items-center gap-2 px-6 py-2 bg-[#ba9eff] text-black font-black text-xs uppercase tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#ba9eff]/10 hover:shadow-[#ba9eff]/20 mr-2"
              >
                Start Game
              </button>
            )}
            <a 
              href="https://github.com/Ethan4582/Blitzr" 
              target="_blank"
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
              title="Give it a star on GitHub"
            >
              <Github size={18} />
            </a>
            <a 
              href="https://ash-cv.vercel.app/" 
              target="_blank"
              className="text-slate-400 hover:text-[#ba9eff] transition-all p-2 hover:bg-white/5 rounded-full"
              title="Creator Portfolio"
            >
              <User size={18} strokeWidth={2.5} />
            </a>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10" />

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden hover:border-[#ba9eff]/50 transition-all focus:outline-none group"
                >
                  <img
                    alt="User"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || session.user.email}`}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-56 bg-[#131314] border border-white/[0.08] rounded-2xl shadow-2xl p-2 z-[110] backdrop-blur-xl"
                    >
                      <div className="px-4 py-3 border-b border-white/[0.05] mb-1">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">Logged in as</p>
                        <p className="text-sm font-bold text-white truncate">{profile?.username || session.user.email}</p>
                      </div>
                      
                      <Link 
                        href="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                      
                      <Link 
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <User size={16} />
                        Profile
                      </Link>

                      <div className="h-px bg-white/[0.05] my-1" />

                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => router.push('/login')}
                  className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-white transition-all"
                >
                  Login
                </button>
                <button 
                  onClick={() => router.push('/login')}
                  className="px-6 py-2 bg-[#ba9eff] text-black font-black text-sm rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#ba9eff]/10"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
