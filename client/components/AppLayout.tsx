'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LeftSidebar } from './LeftSidebar';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  isConnected?: boolean;
}

export function AppLayout({ children, isConnected = true }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchAuth();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    <div className="bg-[#0e0e0f] text-slate-100 flex flex-col items-center selection:bg-[#ba9eff]/30 overflow-hidden h-screen font-body relative">
      <Navbar 
        isConnected={isConnected}
        onStartGame={handleStartGame}
      />

      <LeftSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        profile={profile}
      />

      <main className={`flex-grow flex mt-16 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} relative overflow-hidden w-full border-l border-white/[0.05] bg-[#0c0c0d]`}>
        {children}
      </main>
    </div>
  );
}
