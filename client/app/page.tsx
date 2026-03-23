'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AuthModal from '@/components/AuthModal';
import { User, Users, View, Sparkles, Trophy, LogOut, ChevronRight, Target, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const router = useRouter();

  // ─── Auth State Management ───
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

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handlePlayFriend = async () => {
    if (!session) {
      setIsAuthOpen(true);
      return;
    }

    try {
      // 🏆 CREATE PERSISTENT THE ROOM IN SUPABASE
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          white_player_id: session.user.id,
          status: 'waiting'
        })
        .select()
        .single();
      
      if (error) throw error;

      // Navigate using the Official Room ID
      router.push(`/game/${data.id}?role=white`);
    } catch (err: any) {
      alert(`Failed to create room: ${err.message}`);
    }
  };

  const handleViewGame = () => {
    const id = prompt('Enter Game ID:');
    if (id) router.push(`/game/${id}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#070708] text-slate-100 overflow-hidden relative">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* ─── Background Elements ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-xl z-10 space-y-12"
      >
        {/* ─── Hero Header ─── */}
        <div className="text-center space-y-6">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 0.95, 1] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
            className="inline-flex items-center justify-center mb-2 p-6 rounded-[40px] bg-indigo-600/10 text-indigo-500 shadow-[0_0_80px_rgba(79,70,229,0.15)] border border-indigo-500/10"
          >
            <Trophy size={64} className="drop-shadow-[0_0_20px_rgba(79,70,229,0.3)]" />
          </motion.div>
          
          <div className="space-y-3">
            <h1 className="text-7xl font-black tracking-tight leading-[0.9]">
              CHESS <span className="bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">MASTER</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-xs mx-auto">
              Elevate your game in a premium real-time grandmaster playground
            </p>
          </div>
        </div>

        {/* ─── Profile / Auth Card ─── */}
        <div className="glass rounded-[48px] p-10 shadow-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck size={120} />
          </div>

          <div className="space-y-10">
            {session ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30">
                    <User size={30} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{profile?.username || session.user.email?.split('@')[0]}</h3>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest mt-1">
                      <Target size={14} />
                      {profile?.points || 1000} ELO POINTS
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all active:scale-90"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-6 bg-slate-900/50 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                    <User size={20} />
                  </div>
                  <div className="text-sm font-bold text-slate-500 tracking-wide">
                    PLEASE SIGN IN TO START RANKED PLAY
                  </div>
                </div>
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="px-6 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                  Sign In
                </button>
              </div>
            )}

            <div className="space-y-4">
              <button 
                onClick={handlePlayFriend}
                className={cn(
                  "w-full py-6 rounded-[32px] font-black text-xl flex items-center justify-center gap-4 transition-all relative overflow-hidden group/btn",
                  !session ? "bg-indigo-600/50 text-white/50" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_10px_40px_-5px_rgba(79,70,229,0.4)]"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                <Users size={24} />
                CHALLENGE A FRIEND
                <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={handleViewGame}
                className="w-full py-4 text-slate-500 font-bold hover:text-slate-100 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
              >
                <View size={18} />
                Enter Spectator Mode
              </button>
            </div>
          </div>
        </div>

        {/* ─── Footer Stats ─── */}
        <div className="flex items-center justify-center gap-12 text-slate-600">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-shadow" />
            <span className="text-sm font-black tracking-widest uppercase">1.2k Live</span>
          </div>
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-2 h-2 rounded-full bg-purple-500 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-shadow" />
            <span className="text-sm font-black tracking-widest uppercase">450 Playing</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
