import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Trophy, Medal, Play, Eye, Box, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Chess } from 'chess.js';

// Types
export interface Profile {
  username: string;
  points: number;
}

export interface Room {
  id: string;
  slug: string;
  white_player_id: string;
  black_player_id: string;
  fen: string;
  status: 'waiting' | 'playing' | 'finished';
  winner_id: string | null;
  created_at: string;
  updated_at: string;
  white_player?: Profile;
  black_player?: Profile;
}

// Helpers
export function getPieceUnicode(type: string, color: string): string {
  const pieces: Record<string, Record<string, string>> = {
    p: { w: '♙', b: '♟' },
    r: { w: '♖', b: '♜' },
    n: { w: '♘', b: '♞' },
    b: { w: '♗', b: '♝' },
    q: { w: '♕', b: '♛' },
    k: { w: '♔', b: '♚' },
  };
  return pieces[type]?.[color] || '';
}

export const getTimeAgo = (dateStr: string) => {
  const now = new Date();
  const then = new Date(dateStr);
  const diffInMins = Math.floor((now.getTime() - then.getTime()) / 60000);
  if (diffInMins < 1) return 'Just now';
  if (diffInMins === 1) return '1m ago';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return then.toLocaleDateString();
};

// Components
export const ChessBoardMini = React.memo(({ fen }: { fen: string }) => {
  const board = React.useMemo(() => {
    try {
      const chess = new Chess(fen);
      return chess.board();
    } catch (e) {
      return new Chess().board();
    }
  }, [fen]);

  return (
    <div className="w-full aspect-square grid grid-cols-8 grid-rows-8 border border-white/5 rounded-sm overflow-hidden bg-slate-900/40">
      {board.map((row, rIdx) =>
        row.map((sq, cIdx) => {
          const isLight = (rIdx + cIdx) % 2 === 0;
          return (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`flex items-center justify-center text-[8px] md:text-sm ${
                isLight ? 'bg-[#f0d9b1]/10' : 'bg-[#b58863]/10'
              }`}
            >
              {sq && (
                <span className={sq.color === 'w' ? 'text-slate-100' : 'text-slate-500'}>
                  {getPieceUnicode(sq.type, sq.color)}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
});

ChessBoardMini.displayName = 'ChessBoardMini';

export const GameCard = React.memo(({ room }: { room: Room }) => {
  const isFinished = room.status === 'finished';
  const winnerId = room.winner_id;
  const whiteWinner = isFinished && winnerId === room.white_player_id;
  const blackWinner = isFinished && winnerId === room.black_player_id;
  
  const winnerName = whiteWinner ? (room.white_player?.username || 'White') : blackWinner ? (room.black_player?.username || 'Black') : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group bg-[#131314]/50 border border-white/5 rounded-2xl p-5 md:p-6 hover:bg-[#131314]/80 transition-all duration-300 flex flex-col gap-5 md:gap-6 min-h-[220px] h-full"
    >
      <div className="flex justify-between items-start">
         <div className="flex flex-col gap-1">
           {isFinished ? (
             <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5 italic">
               <Clock size={12} />
               Finished
             </span>
           ) : (
             <span className="text-[9px] md:text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
               Live Update
             </span>
           )}
           <span className="text-[8px] md:text-[9px] text-slate-600 font-medium uppercase tracking-wider">
             {getTimeAgo(room.status === 'finished' ? room.updated_at : room.created_at)}
           </span>
         </div>
         {isFinished && room.winner_id && (
           <div className="px-2 md:px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] md:text-[9px] font-black uppercase tracking-tighter rounded-md flex items-center gap-1.5">
             <Trophy size={10} />
             Awarded
           </div>
         )}
      </div>

      <div className="flex flex-row gap-4 md:gap-6 items-center flex-1">
        <div className="w-20 md:w-24 shrink-0 shadow-2xl">
          <ChessBoardMini fen={room.fen} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
          <div className="space-y-2">
            <div className={`flex items-center justify-between gap-2 p-1 md:p-1.5 rounded-lg transition-colors ${whiteWinner ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-transparent'}`}>
               <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${whiteWinner ? 'bg-emerald-500' : 'bg-white/20'}`} />
                  <span className={`text-[10px] md:text-[11px] font-black uppercase italic truncate ${whiteWinner ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {room.white_player?.username || 'Guest'}
                  </span>
               </div>
               <span className="text-[8px] md:text-[9px] text-slate-600 font-mono shrink-0">
                 {isFinished ? (whiteWinner ? '+10' : '-10') : '1000'}
               </span>
            </div>
            
            <div className={`flex items-center justify-between gap-2 p-1 md:p-1.5 rounded-lg transition-colors ${blackWinner ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-transparent'}`}>
               <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${blackWinner ? 'bg-emerald-500' : 'bg-white/20'}`} />
                  <span className={`text-[10px] md:text-[11px] font-black uppercase italic truncate ${blackWinner ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {room.black_player?.username || 'Guest'}
                  </span>
               </div>
               <span className="text-[8px] md:text-[9px] text-slate-600 font-mono shrink-0">
                 {isFinished ? (blackWinner ? '+10' : '-10') : '1000'}
               </span>
            </div>
          </div>

          {!isFinished ? (
            <Link 
              href={`/game/${room.id}`}
              className="mt-3 md:mt-4 w-full py-2 bg-[#ba9eff]/10 border border-[#ba9eff]/20 text-[#ba9eff] hover:bg-[#ba9eff] hover:text-[#0a0a0b] rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Eye size={12} />
              Watch Live
            </Link>
          ) : (
            <div className="mt-3 md:mt-4 flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg min-w-0">
               <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest italic shrink-0">Winner:</span>
               <span className="text-[9px] md:text-[10px] text-emerald-400 font-black uppercase italic truncate">
                 {winnerName || 'Draw'}
               </span>
               <div className="ml-auto shrink-0">
                 <Medal size={12} className={winnerName ? "text-emerald-500" : "text-slate-700"} />
               </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

GameCard.displayName = 'GameCard';

export const WatchHeader = ({ count }: { count: number }) => (
  <div className="space-y-1.5 md:space-y-2">
    <div className="flex items-center gap-2.5 md:gap-3">
      <Activity className="text-[#ba9eff] w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
      <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-tight uppercase leading-none">Watch Center</h1>
    </div>
    <p className="text-slate-500 text-xs md:text-sm font-medium border-l-2 border-white/5 pl-3 md:pl-4">
      Explore {count} high-stakes battles occurring in real-time.
    </p>
  </div>
);

export const FilterTabs = ({ active, onChange }: { active: string; onChange: (f: any) => void }) => (
  <div className="flex items-center w-full md:w-auto bg-white/[0.03] border border-white/5 p-1 rounded-xl">
    {(['all', 'live', 'finished'] as const).map((f) => (
      <button
        key={f}
        onClick={() => onChange(f)}
        className={`flex-1 md:flex-none md:px-6 py-2 md:py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
          active === f 
          ? 'bg-[#ba9eff] text-[#0a0a0b] shadow-lg shadow-[#ba9eff]/10' 
          : 'text-slate-500 hover:text-white'
        }`}
      >
        {f}
      </button>
    ))}
  </div>
);

export const FeaturedMatch = ({ room }: { room: Room }) => {
  if (!room) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group overflow-hidden rounded-2xl md:rounded-3xl border border-white/5 bg-[#131314] max-w-4xl mx-auto shadow-2xl"
    >
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/watch.bg.png" 
          alt="Featured Match"
          className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#131314]/60 to-transparent" />
      </div>

      <div className="relative z-10 p-6 md:px-10 md:py-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
        <div className="flex-1 space-y-4 text-center md:text-left order-2 md:order-1">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 md:gap-2">
              <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
              Featured Match
            </span>
            <span className="text-slate-500 text-[8px] md:text-[9px] uppercase font-bold tracking-widest">
              Live {getTimeAgo(room.created_at)}
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-[0.95]">
            <span className="text-white truncate block max-w-full">{room.white_player?.username || 'Guest'}</span>
            <span className="block text-[#ba9eff] text-lg lowercase font-light not-italic tracking-normal my-0.5">vs</span>
            <span className="text-white truncate block max-w-full">{room.black_player?.username || 'Guest'}</span>
          </h2>

          <Link 
            href={`/game/${room.id}`}
            className="inline-flex w-full md:w-auto px-7 py-3 bg-[#ba9eff] text-[#0a0a0b] font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all items-center justify-center md:justify-start gap-3 shadow-xl"
          >
            <Play size={12} fill="currentColor" />
            Watch Now
          </Link>
        </div>

        <div className="w-32 md:w-56 shrink-0 order-1 md:order-2">
          <div className="bg-[#0a0a0b]/80 backdrop-blur-xl p-2 rounded-xl border border-white/5 shadow-2xl">
            <ChessBoardMini fen={room.fen} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const EmptyState = () => (
  <div className="py-20 md:py-24 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 px-6">
    <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900/40 rounded-2xl flex items-center justify-center border border-white/5">
      <Box className="text-slate-700 w-7 h-7 md:w-8 md:h-8" />
    </div>
    <div className="space-y-1">
      <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white italic">No matches found</p>
      <p className="text-[10px] md:text-xs text-slate-500">Wait for new warriors or check back later.</p>
    </div>
  </div>
);

export const WatchPagination = ({ page, total, onPageChange }: { page: number, total: number, onPageChange: (p: number) => void }) => (
  <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 gap-6">
    <div className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
       Page {page + 1} of {total}
    </div>
    <div className="flex items-center gap-2">
      <button 
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className="p-2.5 md:p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white disabled:opacity-10 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4 md:w-[18px] md:h-[18px]" />
      </button>
      <div className="flex gap-1 px-1 md:px-2">
        {Array.from({ length: Math.min(5, total) }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black transition-all ${
              page === i ? 'bg-[#ba9eff] text-[#0a0a0b]' : 'bg-white/5 text-slate-500 hover:bg-white/10'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <button 
        disabled={page >= total - 1}
        onClick={() => onPageChange(page + 1)}
        className="p-2.5 md:p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white disabled:opacity-10 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4 md:w-[18px] md:h-[18px]" />
      </button>
    </div>
  </div>
);
