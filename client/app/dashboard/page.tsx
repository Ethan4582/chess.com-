'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      setProfile(data);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0e0e0f] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#b9a2ff] rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0e0e0f] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0e0e0f]/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="flex justify-between items-center w-full px-8 py-5 max-w-screen-2xl mx-auto">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white font-headline flex items-center gap-2">
            Blitzr <span className="w-2 h-2 rounded-full bg-[#b9a2ff]" />
          </Link>
          
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
        </div>
      </nav>

      {/* Dashboard Content */}
      <section className="pt-32 px-8 max-w-screen-2xl mx-auto">
        <h1 className="text-4xl font-black mb-8">Dashboard</h1>
        
        <div className="p-12 rounded-[32px] bg-[#121213] border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-bold text-slate-400 mb-4">Lobby Area (Coming Soon)</h2>
          <p className="text-slate-500 max-w-lg text-center">
            This space will contain active rooms, matchmaking, and player stats in the future. Check back later.
          </p>
        </div>
      </section>
    </main>
  );
}
