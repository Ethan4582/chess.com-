'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { BarChart2, Search, History as HistoryIcon, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function AnalysisRootPage() {
  const router = useRouter();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('rooms')
        .select('*, white_player:profiles!white_player_id(username), black_player:profiles!black_player_id(username)')
        .or(`white_player_id.eq.${session.user.id},black_player_id.eq.${session.user.id}`)
        .eq('status', 'finished')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setGames(data || []);
      setLoading(false);
    };

    fetchGames();
  }, []);

  return (
    <AuthGuard>
      <AppLayout>
        <div className="flex-1 p-8 bg-[#0a0a0b] overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-12 py-12">
            
            {/* Hero Header */}
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-16 h-16 bg-[#ba9eff]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#ba9eff]/20 mb-6"
              >
                <BarChart2 className="text-[#ba9eff]" size={32} />
              </motion.div>
              <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">War Room Archives</h1>
              <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
                Deep dive into your past battles. Study your mistakes, optimize your openings, and achieve master-level precision.
              </p>
            </div>

            {/* Recent Games Grid */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <HistoryIcon size={14} />
                  Recent Games for Evaluation
                </h3>
                <Link href="/history" className="text-[10px] font-black text-[#ba9eff] uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                  Full Arena History
                  <ArrowRight size={12} />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 4].map(i => (
                    <div key={i} className="h-24 bg-white/[0.02] rounded-3xl animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : games.length === 0 ? (
                <div className="bg-[#131314] border border-white/5 p-12 rounded-[32px] text-center space-y-4">
                  <BookOpen className="mx-auto text-slate-700" size={40} />
                  <p className="text-slate-400 text-sm font-medium">No finished games found in your archive yet.</p>
                  <Link href="/dashboard" className="inline-block px-8 py-3 bg-[#ba9eff] text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-all">
                    Start a New Battle
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {games.map((game) => (
                    <Link 
                      key={game.id} 
                      href={`/analysis/${game.id}`}
                      className="group bg-[#131314] border border-white/5 p-6 rounded-3xl flex items-center justify-between hover:border-[#ba9eff]/30 transition-all hover:bg-[#1a1a1b]"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase">{game.white_player?.username || 'Guest'}</span>
                          <span className="text-[10px] text-slate-700">VS</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase">{game.black_player?.username || 'Guest'}</span>
                        </div>
                        <p className="text-sm font-black text-white italic uppercase tracking-tight truncate max-w-[150px]">
                          Archive #{game.id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#ba9eff] group-hover:text-black transition-all">
                        <ArrowRight size={20} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Manual Entry */}
            <div className="bg-gradient-to-r from-[#ba9eff]/5 to-transparent border border-white/5 p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="space-y-1">
                 <h4 className="text-white font-black italic uppercase tracking-tight">Manual Evaluation</h4>
                 <p className="text-slate-500 text-xs font-medium">Direct access to specific game captures.</p>
               </div>
               <div className="flex w-full md:w-auto gap-2">
                 <input 
                   placeholder="ENTER ROOM ID"
                   className="flex-1 md:w-48 bg-black/40 border border-white/10 rounded-xl px-4 text-[10px] font-black text-white uppercase tracking-widest focus:border-[#ba9eff] transition-all outline-none"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       router.push(`/analysis/${e.currentTarget.value}`);
                     }
                   }}
                 />
                 <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-[#ba9eff] transition-all border border-white/5">
                    <Search size={18} />
                 </button>
               </div>
            </div>

          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
