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
        <div className="flex-1 p-4 md:p-8 bg-[#0a0a0b] overflow-y-auto no-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 py-12 md:py-12">
            
         
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-14 h-14 md:w-16 md:h-16 bg-[#ba9eff]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#ba9eff]/20 mb-4 md:mb-6"
              >
                <BarChart2 className="text-[#ba9eff] w-7 h-7 md:w-8 md:h-8" />
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">War Room Archives</h1>
              <p className="text-slate-500 text-sm md:text-lg max-w-xl mx-auto font-medium px-4 md:px-0">
                Deep dive into your past battles. Study your mistakes, optimize your openings, and achieve master-level precision.
              </p>
            </div>

          
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 px-2 md:px-0">
                <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <HistoryIcon size={14} />
                  Games for Evaluation
                </h3>
                <Link href="/history" className="text-[9px] md:text-[10px] font-black text-[#ba9eff] uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                  <span className="hidden sm:inline">Check All</span> History
                  <ArrowRight size={12} />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 4, 5].map(i => (
                    <div key={i} className="h-24 bg-white/[0.02] rounded-[24px] md:rounded-3xl animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : games.length === 0 ? (
                <div className="bg-[#131314] border border-white/5 p-10 md:p-12 rounded-[28px] md:rounded-[32px] text-center space-y-4 mx-2 md:mx-0">
                  <BookOpen className="mx-auto text-slate-700 w-8 h-8 md:w-10 md:h-10" />
                  <p className="text-slate-400 text-xs md:text-sm font-medium">No archived battles detected.</p>
                  <Link href="/lobby" className="inline-block px-6 md:px-8 py-3 bg-[#ba9eff] text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white transition-all active:scale-95 shadow-xl shadow-[#ba9eff]/10">
                    Deploy to Arena
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 md:px-0">
                  {games.map((game) => (
                    <Link 
                      key={game.id} 
                      href={`/analysis/${game.id}`}
                      className="group bg-[#131314] border border-white/5 p-5 md:p-6 rounded-[24px] md:rounded-3xl flex items-center justify-between hover:border-[#ba9eff]/30 transition-all hover:bg-[#1a1a1b]"
                    >
                      <div className="space-y-1 min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase truncate max-w-[80px]">{game.white_player?.username || 'Guest'}</span>
                          <span className="text-[8px] text-slate-700">VS</span>
                          <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase truncate max-w-[80px]">{game.black_player?.username || 'Guest'}</span>
                        </div>
                        <p className="text-xs md:text-sm font-black text-white italic uppercase tracking-tight">
                          Battle #{game.id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#ba9eff] group-hover:text-black transition-all shrink-0">
                        <ArrowRight size={20} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

           
            <div className="bg-gradient-to-r from-[#ba9eff]/5 to-transparent border border-white/5 p-6 md:p-8 rounded-[28px] md:rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 mx-2 md:mx-0">
               <div className="text-center md:text-left space-y-1">
                 <h4 className="text-sm md:text-base text-white font-black italic uppercase tracking-tight">Direct Inspection</h4>
                 <p className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-widest leading-none">Enter unique battle identifier.</p>
               </div>
               <div className="flex w-full md:w-auto gap-2">
                 <input 
                   placeholder="BATTLE IDENTIFIER"
                   className="flex-1 md:w-48 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest focus:border-[#ba9eff] transition-all outline-none"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       router.push(`/analysis/${e.currentTarget.value}`);
                     }
                   }}
                 />
                 <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-[#ba9eff] transition-all border border-white/5 shrink-0">
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
