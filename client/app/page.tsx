'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import LandingHero from '@/components/LandingHero';
import LandingFeatures from '@/components/LandingFeatures';
import LandingFooter from '@/components/LandingFooter';
import LandingCTA from '@/components/LandingCTA';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
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
    const { data } = await supabase
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
      router.push('/login');
      return;
    }
    
    // Instead of creating a room directly from landing page, 
    // we now go to the dashboard / lobby where those actions live.
    router.push('/dashboard');
  };

  const handleViewGame = () => {
    router.push('/watch');
  };

  return (
    <main className="min-h-screen bg-[#0e0e0f] text-white font-body selection:bg-indigo-500/30 overflow-x-hidden">
      <Navbar />

      {/* ─── Hero Section ─── */}
      <LandingHero onPlayFriend={handlePlayFriend} onViewGame={handleViewGame} />

      {/* ─── Features Grid ─── */}
      <LandingFeatures />

      {/* ─── CTA Section ─── */}
      <LandingCTA onSignUp={() => router.push('/login')} />

      {/* ─── Footer ─── */}
      <LandingFooter />
    </main>
  );
}
