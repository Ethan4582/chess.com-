'use client'

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Medal, Search, ChevronLeft, ChevronRight, User, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const ITEMS_PER_PAGE = 20;

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, [page]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('points', { ascending: false })
      .order('created_at', { ascending: true }) // Stable tie-breaking
      .range(from, to);

    if (error) {
      console.error(error);
    } else {
      setUsers(data || []);
      if (count !== null) setTotalCount(count);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <AppLayout>
      <div className="h-full flex flex-col p-4 md:p-8 bg-[#0a0a0b] overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-6 md:space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 shrink-0 pt-4 md:pt-0">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-[#ba9eff] text-[10px] font-black uppercase tracking-[0.3em]"
              >
                <TrendingUp size={14} />
                Global Rankings
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">Grandmaster League</h1>
              <p className="text-slate-500 font-medium text-xs md:text-sm max-w-xl">
                The definitive list of the arena's most lethal strategists. Rankings are updated in real-time as battles conclude.
              </p>
            </div>
          </div>

          {/* Ranking List/Table */}
          <div className="bg-[#131314] rounded-2xl md:rounded-xl border border-white/5 shadow-2xl overflow-hidden relative flex-1 flex flex-col min-h-0">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white/[0.01] border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-4 md:px-8 py-4 w-16 md:w-20 bg-[#131314]">Rank</th>
                    <th className="px-4 md:px-8 py-4 bg-[#131314]">Strategist</th>
                    <th className="px-4 md:px-8 py-4 w-24 md:w-32 bg-[#131314]">ELO</th>
                    <th className="px-8 py-4 hidden md:table-cell bg-[#131314]">W / L / D</th>
                    <th className="px-4 md:px-8 py-4 text-right bg-[#131314]">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {!loading && users.map((user, i) => {
                    const globalRank = (page - 1) * ITEMS_PER_PAGE + i + 1;

                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-white/[0.01] transition-all duration-300"
                      >
                        <td className="px-4 md:px-8 py-4">
                          <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-black italic text-[10px] md:text-xs shrink-0 ${
                            globalRank === 1 ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                            globalRank === 2 ? 'bg-slate-300 text-black shadow-[0_0_15px_rgba(203,213,225,0.1)]' :
                            globalRank === 3 ? 'bg-amber-700 text-white shadow-[0_0_15px_rgba(120,53,15,0.1)]' :
                            'text-slate-500 font-mono bg-white/[0.03] border border-white/5'
                          }`}>
                            {globalRank}
                          </div>
                        </td>
                        <td className="px-2 md:px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 p-0.5 border border-white/10 group-hover:border-[#ba9eff]/30 transition-all overflow-hidden shrink-0">
                              <img
                                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`}
                                alt="Avatar"
                                className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-black text-white uppercase italic tracking-tight group-hover:text-[#ba9eff] transition-colors text-[12px] md:text-[14px] truncate max-w-[100px] sm:max-w-none">
                                {user.username}
                              </span>
                              <span className="md:hidden text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
                                {user.wins}W / {user.losses}L
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-8 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm md:text-xl font-black text-white tabular-nums tracking-tighter italic">
                              {user.points}
                            </span>
                            <span className="md:hidden text-[8px] font-black text-[#ba9eff]/40 uppercase tracking-widest">ELO</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 hidden md:table-cell text-slate-500 text-[10px] font-black font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500/80">{user.wins}</span>
                            <span className="text-slate-800">/</span>
                            <span className="text-rose-500/80">{user.losses}</span>
                            <span className="text-slate-800">/</span>
                            <span className="text-slate-600">{user.draws}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-8 py-4 text-right">
                          <Link
                            href={`/profile/${user.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-4 md:py-2 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-[#ba9eff] hover:bg-[#ba9eff]/5 hover:border-[#ba9eff]/10 transition-all active:scale-90"
                          >
                            <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">Inspect</span>
                            <User size={14} className="md:hidden" />
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#131314]/80 backdrop-blur-sm z-20">
                  <div className="w-8 h-8 border-4 border-[#ba9eff]/20 border-t-[#ba9eff] rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 bg-white/[0.01] shrink-0">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Displaying TOP {totalCount} Strategists
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white disabled:opacity-20 transition-all border border-white/5"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="px-4 text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest border-x border-white/5 mx-2">
                  PAGE {page} <span className="text-slate-600">/ {totalPages || 1}</span>
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0 || loading}
                  className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white disabled:opacity-20 transition-all border border-white/5"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
