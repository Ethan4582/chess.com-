'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Gamepad2, History as HistoryIcon, ChevronLeft, ChevronRight, Swords, Star, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameRecord {
  id: string;
  result: 'WIN' | 'LOSS' | 'DRAW';
  opponent: string;
  opponentId: string;
  date: string;
  eloChange: number;
}

const ITEMS_PER_PAGE = 8;

interface ProfileViewProps {
  targetUserId: string;
  isOwnProfile?: boolean;
}

export function ProfileView({ targetUserId, isOwnProfile = false }: ProfileViewProps) {
  const [profile, setProfile] = useState<any>(null);
  const [games, setGames] = useState<GameRecord[]>([]);
  const [trajectoryGames, setTrajectoryGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);

  // Dynamic Trajectory Data based on fetched games
  const trajectoryData = useMemo(() => {
    if (!profile) return [];
    
    let currentP = profile.points || 1000;
    const history = [{ value: currentP, active: true }];
    
    // Backtrack from trajectoryGames (last 20)
    trajectoryGames.forEach((g) => {
      currentP -= g.eloChange;
      history.unshift({ value: currentP, active: false });
    });

    // Normalize to 0-100 range for the chart display
    const values = history.map(h => h.value);
    const min = Math.min(...values) - 20;
    const max = Math.max(...values) + 20;
    const range = max - min || 1;

    return history.map(h => ({
      value: ((h.value - min) / range) * 100,
      active: h.active,
      actualPoints: h.value
    }));
  }, [trajectoryGames, profile]);

  useEffect(() => {
    const fetchData = async () => {
      // 0. Cache check
      const cacheKey = `profile_view_${targetUserId}`;
      if (page === 1) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { profile: p, games: g, trajectory: tr, total: t, rank: r, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setProfile(p);
            setGames(g);
            setTrajectoryGames(tr || []);
            setTotalCount(t);
            setUserRank(r);
            setLoading(false);
          }
        }
      }

      setLoading(true);

      try {
        // 1. Fetch Profile and Rank
        const [{ data: profileData }, { data: rankData }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', targetUserId).single(),
          supabase.rpc('get_user_rank', { target_user_id: targetUserId })
        ]);

        if (profileData) setProfile(profileData);
        if (rankData !== undefined) setUserRank(rankData);

        // 2. Fetch Finished Games (Paginated for History)
        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        // 3. Fetch Trajectory Games (Last 20, only on first load)
        const trajectoryPromise = page === 1 
          ? supabase.from('rooms').select('*').or(`white_player_id.eq.${targetUserId},black_player_id.eq.${targetUserId}`).eq('status', 'finished').order('created_at', { ascending: false }).limit(20)
          : Promise.resolve({ data: null });

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

        const { data: trajData } = await trajectoryPromise;

        if (count !== null) setTotalCount(count);

        const formatRoom = (room: any) => {
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
            date: new Date(room.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            eloChange
          };
        };

        if (roomsData) {
          const formatted = roomsData.map(formatRoom);
          setGames(formatted);

          let finalTraj = trajectoryGames;
          if (trajData) {
            finalTraj = trajData.map((r: any) => {
               const win = r.winner_id === targetUserId;
               const draw = r.winner_id === null;
               return { eloChange: draw ? 0 : (win ? 25 : -15) };
            }) as any;
            setTrajectoryGames(finalTraj);
          }

          // Update Cache
          if (page === 1 && profileData) {
            localStorage.setItem(cacheKey, JSON.stringify({
              profile: profileData,
              games: formatted,
              trajectory: finalTraj,
              total: count,
              rank: rankData,
              timestamp: Date.now()
            }));
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, targetUserId]);

  const totalGamesDB = (profile?.wins || 0) + (profile?.losses || 0) + (profile?.draws || 0);
  const winRate = totalGamesDB > 0 ? ((profile?.wins || 0) / totalGamesDB * 100).toFixed(1) : '0';
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const username = profile?.username || 'Strategist';
  const points = profile?.points || 1000;
  const currentRank = userRank || 0;

  const handleChallenge = () => {
     // Logic for challenge could go here
     alert(`Challenge sent to ${username}!`);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#0a0a0b] custom-scrollbar h-full">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Sidebar Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#131314] border border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl relative overflow-hidden group"
            >
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-48 h-48 rounded-[2.5rem] bg-gradient-to-br from-[#ba9eff]/20 to-transparent border border-white/10 p-1 group-hover:border-[#ba9eff]/30 transition-all duration-700">
                    <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-black shadow-inner relative">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={username} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <img 
                          src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`}
                          alt={username}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  </div>
                  {/* Status Badge */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[#ba9eff] border-4 border-[#131314] flex items-center justify-center text-black">
                     <Star size={16} fill="black" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{username}</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    Grandmaster • Rank #{currentRank}
                  </p>
                </div>
              </div>

              {/* Stats Inside Card */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Global Rating</span>
                    <p className="text-xl font-black text-white italic tabular-nums">{points}</p>
                 </div>
                 <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Success Ratio</span>
                    <p className="text-xl font-black text-white italic tabular-nums">{winRate}%</p>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isOwnProfile ? (
                  <button 
                    onClick={handleChallenge}
                    className="w-full py-4 bg-[#ba9eff] hover:bg-[#a686ff] text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-lg shadow-[#ba9eff]/20 flex items-center justify-center gap-3"
                  >
                    <Swords size={18} />
                    Challenge to Battle
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group">
                      Edit Profile
                    </button>
                    <button className="py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group">
                      Settings
                    </button>
                  </div>
                )}
              </div>

              {/* Specialities Labels */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Strategic Specialties</p>
                 <div className="flex flex-wrap gap-2">
                    {['Sicilian Defense', 'Rapid Tactics', 'Endgame Pro', 'Void Gambit'].map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full text-[9px] font-black uppercase text-slate-400">
                        {tag}
                      </span>
                    ))}
                 </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Dashboard Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <MiniStat label="Total Battles" value={totalGamesDB} icon={<Gamepad2 size={14}/>} />
               <MiniStat label="Victories" value={profile?.wins || 0} icon={<Trophy size={14} className="text-emerald-500" />} />
               <MiniStat label="Defeats" value={profile?.losses || 0} icon={<Trophy size={14} className="text-rose-500 rotate-180" />} />
               <MiniStat label="Stalemates" value={profile?.draws || 0} icon={<HistoryIcon size={14} className="text-slate-500" />} />
            </div>

            {/* Battle History Table */}
            <div className="bg-[#131314] rounded-[32px] border border-white/5 overflow-hidden shadow-xl">
               <div className="p-6 pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white italic uppercase tracking-wider">Recent Battle History</h3>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-all">
                     <TrendingUp size={16} />
                  </button>
               </div>
               
               <div className="overflow-x-auto min-h-[350px]">
                 <table className="w-full text-left">
                    <thead className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Rival</th>
                        <th className="px-6 py-4">Rating Lift</th>
                        <th className="px-6 py-4">Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                       {games.map((game) => (
                         <tr key={game.id} className="group hover:bg-white/[0.01] transition-all">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    game.result === 'WIN' ? 'bg-emerald-500' :
                                    game.result === 'LOSS' ? 'bg-rose-500' : 'bg-slate-500'
                                  }`} />
                                  <span className={`text-[11px] font-bold ${
                                    game.result === 'WIN' ? 'text-emerald-500' :
                                    game.result === 'LOSS' ? 'text-rose-500' : 'text-slate-400'
                                  }`}>{game.result}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/5">
                                     <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${game.opponent}`} alt="Rival" />
                                  </div>
                                  <span className="text-xs font-bold text-white tracking-tight">{game.opponent}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 tabular-nums">
                               <span className={`text-[11px] font-black font-mono tracking-tighter ${
                                 game.eloChange > 0 ? 'text-[#ba9eff]' : 
                                 game.eloChange < 0 ? 'text-rose-400' : 'text-slate-500'
                               }`}>
                                 {game.eloChange > 0 ? `+${game.eloChange.toFixed(1)}` : game.eloChange || '0.0'}
                               </span>
                            </td>
                            <td className="px-6 py-4">
                               <span className="text-[10px] font-bold text-slate-600 tabular-nums">{game.date}</span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>

               {/* Pagination Component */}
               <div className="p-4 border-t border-white/5 flex items-center justify-between">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-2">Last Engagement Log</p>
                  <div className="flex items-center gap-2">
                     <button 
                       onClick={() => setPage(p => Math.max(1, p - 1))}
                       className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-[#ba9eff] disabled:opacity-20 transition-all"
                       disabled={page === 1}
                     >
                        <ChevronLeft size={16} />
                     </button>
                     <span className="text-[10px] font-black text-[#ba9eff]">{page}</span>
                     <button 
                       onClick={() => setPage(p => p + 1)}
                       className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-[#ba9eff] disabled:opacity-20 transition-all"
                       disabled={page >= totalPages}
                     >
                        <ChevronRight size={16} />
                     </button>
                  </div>
               </div>
            </div>

            {/* Bottom Chart: Rating Trajectory */}
            <div className="bg-[#131314] rounded-[32px] border border-white/5 p-8 shadow-xl">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Rating Trajectory (30D)</h3>
               </div>
               
               <div className="h-40 flex items-end justify-between gap-3 px-2">
                  {trajectoryData.map((d, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${d.value}%` }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className={`flex-1 rounded-xl relative group ${
                        d.active ? 'bg-[#ba9eff]' : 'bg-[#ba9eff]/20'
                      }`}
                    >
                       <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <span className="text-[9px] font-black text-white italic">{Math.round(d.actualPoints)} ELO</span>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-[#131314] border border-white/5 p-6 rounded-[28px] space-y-2 hover:border-[#ba9eff]/20 transition-all group">
      <div className="flex items-center justify-between">
         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
         <div className="text-slate-500 group-hover:text-[#ba9eff] transition-colors">{icon}</div>
      </div>
      <p className="text-4xl font-black text-white italic tracking-tighter tabular-nums group-hover:scale-105 origin-left transition-transform duration-500">{value}</p>
    </div>
  );
}
