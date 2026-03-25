'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LeftSidebar } from './LeftSidebar';
import { Navbar } from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  isConnected?: boolean;
  role?: 'w' | 'b' | 'spectator' | null;
  disconnectTimer?: number | null;
  onInvite?: () => void;
  onWatch?: () => void;
  roomName?: string;
}

export function AppLayout({ 
  children, isConnected = true, role, disconnectTimer, onInvite, onWatch, roomName 
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  }, []);

  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    let profileSubscription: any = null;
    let isFetching = false;

    const fetchProfileData = async (userId: string) => {
      if (isFetching) return;
      isFetching = true;
      try {
        const [{ data }, { data: rank }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
          supabase.rpc('get_user_rank', { target_user_id: userId })
        ]);
        if (data) setProfile({ ...data, rank });
      } finally {
        isFetching = false;
      }
    };

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (session) {
        fetchProfileData(session.user.id);
        
        if (!profileSubscription) {
          profileSubscription = supabase
            .channel(`profile-${session.user.id}`)
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
              (payload) => { if (payload.new) setProfile(payload.new); }
            )
            .subscribe();
        }
      } else {
        setProfile(null);
        if (profileSubscription) {
          profileSubscription.unsubscribe();
          profileSubscription = null;
        }
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      authSubscription.unsubscribe();
      if (profileSubscription) profileSubscription.unsubscribe();
    };
  }, []);

  const handleStartGame = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          white_player_id: session.user.id,
          status: 'waiting'
        })
        .select()
        .single();
      
      if (error) throw error;
      router.push(`/game/${data.id}?role=white`);
    } catch (err: any) {
      alert(`Failed to start game: ${err.message}`);
    }
  };

  return (
    <div className="bg-[#0e0e0f] text-slate-100 flex flex-col h-screen overflow-hidden selection:bg-[#ba9eff]/30 font-body relative">
      <Navbar 
        isConnected={isConnected}
        onStartGame={handleStartGame}
        role={role}
        disconnectTimer={disconnectTimer}
        profile={profile}
        session={session}
        onInvite={onInvite}
        onWatch={onWatch}
        roomName={roomName}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      <div className="flex flex-1 overflow-hidden pt-16">
        
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="hidden md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        <LeftSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          profile={profile}
        />

        <main className="flex-1 relative overflow-hidden bg-[#0c0c0d] flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
