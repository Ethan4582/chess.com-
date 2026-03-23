'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';

import { AppLayout } from '@/components/AppLayout';

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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0e0e0f] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#b9a2ff] rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <AppLayout>
      <section className="p-8 w-full max-w-screen-2xl mx-auto h-full overflow-y-auto">
        <h1 className="text-4xl font-black mb-8 text-white tracking-tighter">Dashboard</h1>
        
        <div className="p-12 rounded-[32px] bg-[#121213] border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-bold text-slate-400 mb-4">Lobby Area (Coming Soon)</h2>
          <p className="text-slate-500 max-w-lg text-center">
            This space will contain active rooms, matchmaking, and player stats in the future. Check back later.
          </p>
        </div>
      </section>
    </AppLayout>
  );
}
