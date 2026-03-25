'use client'

import React from 'react';
import { Trophy, History, ChevronRight, Swords, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface GameRecord {
  id: string;
  opponent: string;
  result: 'WIN' | 'LOSS' | 'DRAW';
  date: string;
}

interface RecentMatchesProps {
  games: GameRecord[];
  loading: boolean;
}

export function RecentMatches({ games, loading }: RecentMatchesProps) {
  return (
    <div className="space-y-6 pt-4">
      <h2 className="text-2xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
        Recent Activity
      </h2>
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
             <div key={i} className="h-16 bg-[#131314] rounded-2xl animate-pulse border border-white/5" />
          ))
        ) : games.length === 0 ? (
          <div className="p-12 text-center rounded-[2rem] bg-[#131314] border border-white/5">
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">No past archives Found</p>
          </div>
        ) : (
          games.map((game, i) => (
            <motion.div 
               key={game.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.05 }}
               className="flex items-center justify-between p-4 bg-[#131314]/50 border border-white/5 rounded-2xl group hover:bg-[#131314] hover:border-white/10 transition-all cursor-pointer"
            >
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                     game.result === 'WIN' ? 'bg-[#ba9eff]/10 text-[#ba9eff] border-[#ba9eff]/20 shadow-lg shadow-[#ba9eff]/10' :
                     game.result === 'LOSS' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                     'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  }`}>
                    {game.result === 'WIN' ? <Trophy size={20} className="fill-[#ba9eff]/20" /> : <Swords size={20} />}
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-black text-white italic uppercase truncate max-w-[150px] md:max-w-none">{game.result === 'WIN' ? 'Victory over' : game.result === 'LOSS' ? 'Defeat by' : 'Stalemate with'} {game.opponent}</h4>
                    <p className="text-[9px] md:text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-tight">{game.date} • {game.result === 'WIN' ? '+12 Elo' : game.result === 'LOSS' ? '-10 Elo' : '0 Elo'}</p>
                  </div>
               </div>
               
               <Link 
                  href={`/analysis/${game.id}`}
                  className="p-2 rounded-lg bg-white/5 text-slate-500 group-hover:text-white group-hover:bg-[#ba9eff]/10 transition-all border border-white/5 group-hover:border-[#ba9eff]/20"
               >
                  <ChevronRight size={18} />
               </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
