'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LeftSidebar } from './LeftSidebar';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  isConnected?: boolean;
  role?: 'w' | 'b' | 'spectator' | null;
  disconnectTimer?: number | null;
}

export function AppLayout({ children, isConnected = true, role, disconnectTimer }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    let profileSubscription: any = null;

    const fetchAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const [{ data }, { data: rank }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
          supabase.rpc('get_user_rank', { target_user_id: session.user.id })
        ]);
        if (data) setProfile({ ...data, rank });
        
        // Subscribe to real-time updates
        profileSubscription = supabase
          .channel(`profile-${session.user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${session.user.id}`,
            },
            (payload) => {
              if (payload.new) setProfile(payload.new);
            }
          )
          .subscribe();
      }
    };
    fetchAuth();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Fetch and subscribe if not already
        const fetchNew = async () => {
          const [{ data }, { data: rank }] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
            supabase.rpc('get_user_rank', { target_user_id: session.user.id })
          ]);
          if (data) setProfile({ ...data, rank });
        };
        fetchNew();
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
      />

      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar as a flex child, no absolute/fixed if we want 3-column flow */}
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
