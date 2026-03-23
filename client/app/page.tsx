'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AuthModal from '@/components/AuthModal';
import LandingHero from '@/components/LandingHero';
import LandingFeatures from '@/components/LandingFeatures';
import LandingFooter from '@/components/LandingFooter';
import LandingCTA from '@/components/LandingCTA';
import { LogOut, User, Github } from 'lucide-react';

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
      setIsAuthOpen(true);
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
      alert(`Failed to create room: ${err.message}`);
    }
  };

  const handleViewGame = () => {
    const id = prompt('Enter Game ID:');
    if (id) router.push(`/game/${id}`);
  };

  return (
    <main className="min-h-screen bg-[#0e0e0f] text-white font-body selection:bg-indigo-500/30 overflow-x-hidden">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full z-50 bg-[#0e0e0f]/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="flex justify-between items-center w-full px-8 py-5 max-w-screen-2xl mx-auto">
          <div className="text-2xl font-black tracking-tighter text-white font-headline flex items-center gap-2">
            Blitzr <span className="w-2 h-2 rounded-full bg-[#b9a2ff]" />
          </div>
          
          <div className="hidden md:flex items-center gap-x-6">
            <a 
              href="https://github.com/ashirwad" 
              target="_blank" 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm font-semibold"
            >
              <Github size={18} />
              Star on GitHub
            </a>
            <a 
              href="https://portfolio.com" 
              target="_blank" 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm font-semibold"
            >
              <User size={18} />
              Creator
            </a>

            <div className="w-px h-6 bg-white/10 mx-2" />

            {session ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                  <User size={16} className="text-[#b9a2ff]" />
                  <span className="text-sm font-bold text-white">{profile?.username || 'Player'}</span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-2.5 rounded-full bg-white text-black font-black text-sm transition-all hover:bg-slate-200 shadow-lg shadow-white/5"
              >
                Log In / Sign Up
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <LandingHero onPlayFriend={handlePlayFriend} onViewGame={handleViewGame} />

      {/* ─── Features Grid ─── */}
      <LandingFeatures />

      {/* ─── CTA Section ─── */}
      <LandingCTA onSignUp={() => setIsAuthOpen(true)} />

      {/* ─── Footer ─── */}
      <LandingFooter />
    </main>
  );
}
