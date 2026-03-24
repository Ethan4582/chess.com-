'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Gamepad2, History as HistoryIcon, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameRecord {
  id: string;
  result: 'WIN' | 'LOSS' | 'DRAW';
  opponent: string;
  opponentId: string;
  date: string;
  eloChange: number;
}

const ITEMS_PER_PAGE = 10;

interface ProfileViewProps {
  targetUserId: string;
  isOwnProfile?: boolean;
}

export function ProfileView({ targetUserId, isOwnProfile = false }: ProfileViewProps) {
  const [profile, setProfile] = useState<any>(null);
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [page, targetUserId]);

  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch Profile for top stats
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();
    if (profileData) setProfile(profileData);

    // 2. Fetch Finished Games with pagination
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data: roomsData, count } = await supabase
      .from('rooms')
      .select(`
        *,
        white_profile:profiles!white_player_id(username, id),
        black_profile:profiles!black_player_id(username, id)
      `, { count: 'exact' })
      .or(`white_player_id.eq.${targetUserId},black_player_id.eq.${targetUserId}`)
      .eq('status', 'finished')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (count !== null) setTotalCount(count);

    if (roomsData) {
      const formattedGames = roomsData.map((room: any) => {
        const isWhite = room.white_player_id === targetUserId;
        const opponentProfile = isWhite ? room.black_profile : room.white_profile;
        
        let result: 'WIN' | 'LOSS' | 'DRAW' = 'DRAW';
        let eloChange = 0;

        if (room.winner_id) {
          if (room.winner_id === targetUserId) {
            result = 'WIN';
            eloChange = 25;
          } else {
            result = 'LOSS';
            eloChange = -15;
          }
        }

        return {
          id: room.id,
          result,
          opponent: opponentProfile?.username || 'Guest',
          opponentId: opponentProfile?.id,
          date: new Date(room.created_at).toLocaleDateString(undefined, {
             month: 'short', day: 'numeric'
          }),
          eloChange
        };
      });
      setGames(formattedGames);
    }
    setLoading(false);
  };

  const totalGamesDB = (profile?.wins || 0) + (profile?.losses || 0) + (profile?.draws || 0);
  const winRate = totalGamesDB > 0 ? ((profile?.wins || 0) / totalGamesDB * 100).toFixed(1) : '0';
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0a0a0b] custom-scrollbar h-full">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">
                {isOwnProfile ? 'Arena History' : `${profile?.username || 'Strategist'}'s Dossier`}
            </h1>
            <p className="text-slate-500 font-medium text-[11px] uppercase tracking-[0.2em]">
              Combat archives and performance metrics.
            </p>
          </div>

          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 h-fit">
            
            {/* 1. Primary Highlight (Mastery & Win Rate) - Span 4 */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="group relative overflow-hidden bg-gradient-to-br from-[#1c1c1e] to-[#131314] border border-white/5 p-8 rounded-[32px] hover:border-[#ba9eff]/30 transition-all duration-500 shadow-2xl"
               >
                 <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         Global Rating
                       </span>
                       <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase tabular-nums">
                         {profile?.points || 1200}
                       </h2>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[#ba9eff]/10 flex items-center justify-center border border-[#ba9eff]/20 text-[#ba9eff] group-hover:scale-110 transition-transform duration-700">
                       <HistoryIcon size={28} />
                    </div>
                 </div>
                 <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/5 border border-black shadow-lg" />)}
                    </div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">
                       Elite Division Participant
                    </span>
                 </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="group relative overflow-hidden bg-[#131314] border border-white/5 p-8 rounded-[32px] hover:border-[#ba9eff]/30 transition-all duration-500"
               >
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Success Ratio</span>
                       <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase tabular-nums">
                         {winRate}%
                       </h2>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-amber-500 group-hover:bg-[#ba9eff]/5 group-hover:text-[#ba9eff] transition-all duration-700">
                       <Trophy size={28} />
                    </div>
                 </div>
                 <div className="mt-8 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${winRate}%` }}
                         transition={{ duration: 1.5, delay: 0.5 }}
                         className="h-full bg-gradient-to-r from-amber-500 to-[#ba9eff]"
                       />
                    </div>
                 </div>
               </motion.div>
            </div>

            {/* 2. Secondary Breakdown Grid - Span 6 */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
               <StatsCard 
                 label="Total Battles" 
                 value={totalGamesDB.toString()} 
                 icon={<Gamepad2 size={16} className="text-[#ba9eff]" />} 
                 delay={0.2}
               />
               <StatsCard 
                 label="Victories" 
                 value={(profile?.wins || 0).toString()} 
                 icon={<Trophy size={16} className="text-emerald-500" />} 
                 delay={0.25}
               />
               <StatsCard 
                 label="Defeats" 
                 value={(profile?.losses || 0).toString()} 
                 icon={<Trophy size={16} className="text-red-500 rotate-180" />} 
                 delay={0.3}
               />
               <StatsCard 
                 label="Stalemates" 
                 value={(profile?.draws || 0).toString()} 
                 icon={<HistoryIcon size={16} className="text-slate-500" />} 
                 delay={0.35}
               />
               
               <div className="col-span-2 p-8 rounded-[32px] bg-gradient-to-r from-white/[0.01] to-transparent border border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                     <p className="text-[11px] font-black text-white italic uppercase tracking-tighter">Strategic Efficiency</p>
                     <p className="text-[9px] text-slate-600 uppercase tracking-widest">Calculated across last {totalCount} engagements.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-700">
                     <HistoryIcon size={16} />
                  </div>
               </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#131314] rounded-lg border border-white/5 shadow-sm overflow-hidden relative">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white/[0.01] border-b border-white/5">
                  <tr>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Rival</th>
                    <th className="px-5 py-4">Rating Lift</th>
                    <th className="px-5 py-4">Timeline</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {!loading && games.length === 0 && (
                     <tr>
                        <td colSpan={5} className="py-24 text-center">
                           <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest animate-pulse">Silence in the arena</p>
                        </td>
                     </tr>
                  )}
                  {games.map((game, i) => (
                    <tr key={game.id} className="group hover:bg-white/[0.01] transition-all duration-300">
                      <td className="px-5 py-3">
                        <div className={`w-14 h-5 rounded flex items-center justify-center text-[9px] font-black uppercase tracking-widest border transition-all ${
                          game.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                          game.result === 'LOSS' ? 'bg-rose-500/10 text-rose-400 border-rose-500/10' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/10'
                        }`}>
                          {game.result}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div 
                           className="flex items-center gap-2.5 cursor-pointer group/link"
                           onClick={() => window.location.href = `/profile/${game.opponentId}`}
                        >
                          <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-slate-600 border border-white/5 group-hover/link:border-[#ba9eff]/30 transition-colors overflow-hidden">
                            <img 
                              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${game.opponent}`}
                              alt="Opponent"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-white tracking-tight group-hover/link:text-[#ba9eff] transition-colors">{game.opponent}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-black font-mono tracking-tighter ${
                          game.eloChange > 0 ? 'text-emerald-400' : 
                          game.eloChange < 0 ? 'text-rose-400' : 
                          'text-slate-500'
                        }`}>
                          {game.eloChange > 0 ? `+${game.eloChange}` : game.eloChange || '0'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{game.date}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                         <button 
                           onClick={() => window.location.href = `/analysis/${game.id}`}
                           className="px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#ba9eff] hover:bg-[#ba9eff] hover:text-black transition-all"
                         >
                           View Battle
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-[#131314]/40 backdrop-blur-[1px] z-10 transition-all">
                    <div className="w-5 h-5 border-2 border-[#ba9eff]/20 border-t-[#ba9eff] rounded-full animate-spin" />
                 </div>
              )}
            </div>

            {/* Pagination */}
            <div className="px-5 py-4 flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {loading ? 'Refining results...' : `Showing ${games.length} OF ${totalCount} BATTLES`}
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="p-1 rounded bg-white/5 text-slate-500 hover:text-white disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={14} />
                </button>

                <div className="flex items-center gap-1.5 px-2">
                   {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                     let pNum = i + 1;
                     if (totalPages > 5) {
                        if (page > 3) pNum = page - 3 + i + 1;
                        if (pNum > totalPages) pNum = totalPages - (4 - i);
                     }
                     if (pNum <= 0) return null;
                     return (
                       <button
                         key={pNum}
                         onClick={() => setPage(pNum)}
                         className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-black border transition-all ${
                            page === pNum ? 'bg-[#ba9eff] text-black border-[#ba9eff]' : 'bg-white/5 text-slate-400 border-white/5'
                         }`}
                       >
                         {pNum}
                       </button>
                     );
                   })}
                </div>

                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0 || loading}
                  className="p-1 rounded bg-white/5 text-slate-500 hover:text-white disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

function StatsCard({ label, value, icon, delay }: { label: string, value: string, icon: React.ReactNode, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="p-5 rounded-lg bg-[#131314] border border-white/5 flex items-center justify-between group hover:border-[#ba9eff]/20 transition-all duration-500"
    >
      <div className="space-y-0.5">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-slate-400 transition-colors">{label}</span>
        <h4 className="text-xl font-black text-white tracking-tighter group-hover:scale-105 origin-left transition-transform duration-500">{value}</h4>
      </div>
      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-500 group-hover:text-[#ba9eff] transition-all border border-white/5 group-hover:border-[#ba9eff]/20">
        {icon}
      </div>
    </motion.div>
  );
}
