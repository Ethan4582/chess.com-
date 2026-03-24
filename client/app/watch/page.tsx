'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/lib/supabaseClient';
import { Eye, Play, Users, Trophy, ChevronRight, Clock, Target, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess } from 'chess.js';
import Link from 'next/link';

// ─── Constants & Types ───

interface Profile {
  username: string;
  points: number;
}

interface Room {
  id: string;
  slug: string;
  white_player_id: string;
  black_player_id: string;
  fen: string;
  status: string;
  created_at: string;
  white_player?: Profile;
  black_player?: Profile;
}

// ─── Mini Chessboard Component ───

function getPieceUnicode(type: string, color: string): string {
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

const ChessBoardMini = ({ fen }: { fen: string }) => {
  const board = useMemo(() => {
    try {
      const chess = new Chess(fen);
      return chess.board();
    } catch (e) {
      return new Chess().board();
    }
  }, [fen]);

  return (
    <div className="w-full aspect-square grid grid-cols-8 grid-rows-8 border border-white/5 rounded-md overflow-hidden bg-slate-900/40">
      {board.map((row, rIdx) =>
        row.map((sq, cIdx) => {
          const isLight = (rIdx + cIdx) % 2 === 0;
          return (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`flex items-center justify-center text-[10px] md:text-sm ${
                isLight ? 'bg-[#f0d9b1]/20' : 'bg-[#b58863]/20'
              }`}
            >
              {sq && (
                <span className={sq.color === 'w' ? 'text-white' : 'text-slate-400'}>
                  {getPieceUnicode(sq.type, sq.color)}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

// ─── Main Page Component ───

export default function WatchPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          white_player:profiles!white_player_id(username, points),
          black_player:profiles!black_player_id(username, points)
        `)
        .eq('status', 'playing')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      console.error('Error fetching live rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();

    const channel = supabase
      .channel('live-rooms')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        (payload) => {
          // Instead of complex patching, just refetch for consistency
          // Since it's a small number of playing rooms, this is efficient for live updates
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const featuredRoom = rooms[0];
  const gridRooms = rooms.slice(1);

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffInMins = Math.floor((now.getTime() - then.getTime()) / 60000);
    if (diffInMins < 1) return 'Just started';
    if (diffInMins === 1) return '1 min ago';
    return `${diffInMins} mins ago`;
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-[#0a0a0b]">
        {/* Header Section */}
        <section className="px-8 pt-12 pb-8 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mb-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tight uppercase leading-none">
                Watch Live Games
              </h1>
            </div>
            <p className="text-slate-500 font-medium text-sm md:text-base border-l-2 border-white/5 pl-4 ml-1">
              Currently {rooms.length} active matches in progress.
            </p>
          </motion.div>

          {/* Featured Game Section */}
          <AnimatePresence mode="wait">
            {featuredRoom ? (
              <motion.div
                key={featuredRoom.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group mb-16 overflow-hidden rounded-3xl border border-white/5 bg-[#131314]"
              >
                {/* Background Image Wrapper */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src="/assets/watch.bg.png" 
                    alt="Featured Game Background"
                    className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#131314]/60 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                        Featured Match
                      </span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                        Started {getTimeAgo(featuredRoom.created_at)}
                      </span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                      <span className="text-white">{featuredRoom.white_player?.username || 'Player 1'}</span>
                      <span className="block text-[#ba9eff] text-2xl md:text-3xl lowercase font-light not-italic tracking-normal mt-2">vs</span>
                      <span className="text-white">{featuredRoom.black_player?.username || 'Player 2'}</span>
                    </h2>

                    <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                      <Link 
                        href={`/game/${featuredRoom.id}`}
                        className="px-8 py-4 bg-[#ba9eff] text-[#0a0a0b] font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-white hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_40px_rgba(186,158,255,0.3)] group-hover:shadow-[0_0_60px_rgba(186,158,255,0.5)]"
                      >
                        <Play size={16} fill="currentColor" />
                        Watch Now
                      </Link>
                    </div>
                  </div>

                  {/* Board Preview */}
                  <div className="w-full md:w-80 shrink-0">
                    <div className="bg-[#0a0a0b]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-2xl">
                      <ChessBoardMini fen={featuredRoom.fen} />
                      <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                        <span>White</span>
                        <span>Black</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-20 h-20 bg-slate-900/50 rounded-2xl flex items-center justify-center border border-white/5">
                   <Box className="text-slate-700" size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white uppercase italic tracking-wider">No live games right now</h3>
                  <p className="text-slate-500 text-sm max-w-xs">Be the first to start a battlefield match today.</p>
                </div>
                <Link 
                  href="/dashboard"
                  className="px-6 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#ba9eff] hover:bg-[#ba9eff]/10 hover:border-[#ba9eff]/20 transition-all"
                >
                  Start a Game
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Games Grid */}
          {gridRooms.length > 0 && (
            <div className="space-y-8 mb-20">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3 italic">
                  <Target size={14} className="text-[#ba9eff]" />
                  Active Matches
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-[#131314]/40 border border-white/5 rounded-2xl p-5 hover:bg-[#131314]/80 transition-all duration-300 flex flex-col gap-5"
                  >
                    <div className="flex justify-between items-start">
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[10px] text-red-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                           <div className="w-1 h-1 rounded-full bg-red-400" />
                           Live
                         </span>
                         <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider italic">
                           {getTimeAgo(room.created_at)}
                         </span>
                       </div>
                       <div className="flex -space-x-1.5">
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-[#ba9eff]/30 flex items-center justify-center text-[8px] font-bold text-[#ba9eff]">W</div>
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">B</div>
                       </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="w-24 shrink-0">
                        <ChessBoardMini fen={room.fen} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                             <span className="text-[11px] font-black text-white uppercase italic truncate max-w-[80px]">
                               {room.white_player?.username || 'Anonymous'}
                             </span>
                             <span className="text-[9px] text-slate-600 font-mono">
                               {room.white_player?.points || 1000}
                             </span>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-[11px] font-black text-white uppercase italic truncate max-w-[80px]">
                               {room.black_player?.username || 'Anonymous'}
                             </span>
                             <span className="text-[9px] text-slate-600 font-mono">
                               {room.black_player?.points || 1000}
                             </span>
                          </div>
                        </div>

                        <Link 
                          href={`/game/${room.id}`}
                          className="w-full py-2 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#ba9eff] group-hover:bg-[#ba9eff] group-hover:text-[#0a0a0b] transition-all flex items-center justify-center gap-2"
                        >
                          <Eye size={10} />
                          Watch Live
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
               <div className="w-12 h-12 rounded-xl border-2 border-[#ba9eff]/20 border-t-[#ba9eff] animate-spin mb-4" />
               <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Scanning Board States...</p>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
