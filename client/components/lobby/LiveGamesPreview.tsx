'use client'

import React from 'react';
import { Eye, Swords, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface GameRoom {
  id: string;
  white_player?: { username: string };
  black_player?: { username: string };
  spectators_count: number;
}

interface LiveGamesPreviewProps {
  games: GameRoom[];
  loading: boolean;
}

export function LiveGamesPreview({ games, loading }: LiveGamesPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
           <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
           Live Engagements
         </h2>
         <Link href="/watch" className="text-[10px] font-black uppercase tracking-widest text-[#ba9eff] hover:underline">
            View Arena
         </Link>
      </div>

      {!loading && games.length === 0 && (
        <div className="p-12 text-center rounded-[2rem] bg-[#131314] border border-white/5">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">The arena is silent</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
             <div key={i} className="h-48 bg-[#131314] rounded-[2rem] border border-white/5 animate-pulse" />
          ))
        ) : (
          games.map((game, i) => (
            <motion.div 
               key={game.id}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className="bg-[#131314] p-6 rounded-[2rem] hover:bg-[#1a1a1b] transition-all group flex flex-col justify-between h-48 border border-white/[0.03]"
            >
               <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                     <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">{game.id.slice(0, 8).toUpperCase()}</p>
                     <p className="text-lg font-black text-white italic truncate max-w-[200px]">
                       {game.white_player?.username || 'Guest'} vs {game.black_player?.username || 'Guest'}
                     </p>
                  </div>
                  <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[9px] font-black rounded-full border border-rose-500/20">LIVE</span>
               </div>

               <div className="flex items-center justify-between mb-6">
                  <div className="flex -space-x-3 shrink-0">
                    <div className="w-12 h-12 rounded-full border-4 border-[#131314] overflow-hidden group-hover:border-[#1a1a1b] transition-all bg-white/5 shadow-xl">
                      <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${game.white_player?.username || 'Guest'}`} alt="p1" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-[#131314] overflow-hidden group-hover:border-[#1a1a1b] transition-all bg-white/5 shadow-xl">
                      <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${game.black_player?.username || 'Guest'}`} alt="p2" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Spectators</p>
                     <p className="text-lg font-black text-[#ba9eff] tabular-nums tracking-tighter italic">{game.spectators_count || 0}</p>
                  </div>
               </div>
               
               <Link 
                  href={`/game/${game.id}`}
                  className="w-full py-2.5 rounded-xl bg-white/5 text-slate-400 font-bold text-[10px] uppercase tracking-widest text-center border border-white/5 hover:border-[#ba9eff]/30 group-hover:bg-white/10 group-hover:text-white transition-all shadow-lg"
                >
                  Watch Now
                </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
