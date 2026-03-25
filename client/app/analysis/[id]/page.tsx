'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/lib/supabaseClient';
import { Chess } from 'chess.js';
import ChessBoard from '@/components/game_canvas/ChessBoard';
import {
  BarChart2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RefreshCw,
  Clock,
  Trophy,
  ArrowLeft,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

interface Move {
  id: string;
  move_notation: string;
  fen_after: string;
  created_at: string;
}

interface Room {
  id: string;
  status: 'playing' | 'finished';
  white_player_id: string;
  black_player_id: string;
  winner_id: string | null;
  created_at: string;
  white_player?: { username: string; points: number };
  black_player?: { username: string; points: number };
}

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  const [room, setRoom] = useState<Room | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = start position

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Room Info
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*, white_player:profiles!white_player_id(username, points), black_player:profiles!black_player_id(username, points)')
        .eq('id', id)
        .single();

      if (roomError) throw new Error('Room not found');
      setRoom(roomData);

      // 2. Fetch Moves
      const { data: movesData, error: movesError } = await supabase
        .from('moves')
        .select('*')
        .eq('room_id', id)
        .order('created_at', { ascending: true });

      if (movesError) throw movesError;
      setMoves(movesData || []);
      setCurrentIndex((movesData?.length || 0) - 1); // Point to the last move by default
    } catch (err: any) {
      setError(err.message || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const duration = useMemo(() => {
    if (!room || moves.length === 0) return '0m 0s';
    const start = new Date(room.created_at).getTime();
    const end = new Date(moves[moves.length - 1].created_at).getTime();
    const diff = Math.max(0, end - start);
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }, [room, moves]);

  const currentFen = useMemo(() => {
    if (currentIndex === -1) return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    return moves[currentIndex]?.fen_after || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }, [currentIndex, moves]);

  const handleNavigate = (dir: 'prev' | 'next' | 'start' | 'end') => {
    if (dir === 'prev') setCurrentIndex(prev => Math.max(-1, prev - 1));
    if (dir === 'next') setCurrentIndex(prev => Math.min(moves.length - 1, prev + 1));
    if (dir === 'start') setCurrentIndex(-1);
    if (dir === 'end') setCurrentIndex(moves.length - 1);
  };

  if (loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0b]">
            <RefreshCw className="text-[#ba9eff] animate-spin mb-4" size={32} />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Deep Evaluating Board...</p>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  if (error || !room) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0b] p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
              <Info className="text-red-500" size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white italic uppercase">{error || 'Invalid Room'}</h2>
              <p className="text-slate-600 text-sm">This room ID does not exist or has been archived.</p>
            </div>
            <Link href="/lobby" className="px-6 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
              Return Home
            </Link>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  const winnerName = room.winner_id === room.white_player_id
    ? (room.white_player?.username || 'White')
    : room.winner_id === room.black_player_id
      ? (room.black_player?.username || 'Black')
      : 'Draw';

  return (
    <AuthGuard>
      <AppLayout>
        <div className="flex-1 flex flex-col lg:flex-row bg-[#0a0a0b] overflow-hidden">

          {/* Left Side: Board & Info */}
          <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto no-scrollbar gap-6 md:gap-8">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <Link href="/analysis" className="p-2 hover:bg-white/5 rounded-lg transition-all text-slate-500 border border-transparent hover:border-white/5 shrink-0">
                  <ArrowLeft size={18} />
                </Link>
                <div className="space-y-0.5 min-w-0">
                  <h1 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tight truncate">Battle Archive</h1>
                  <div className="flex items-center gap-2 text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none">
                    <BarChart2 size={12} className="text-[#ba9eff]" />
                    ID: {id.slice(0, 8)}
                  </div>
                </div>
              </div>

              <button
                onClick={fetchData}
                className="p-2 md:p-2.5 bg-white/5 hover:bg-[#ba9eff]/10 border border-white/10 rounded-xl text-[#ba9eff] transition-all flex items-center gap-2 shrink-0"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden sm:inline">Sync</span>
              </button>
            </div>

            {/* In Progress Warning */}
            {room.status !== 'finished' && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 md:gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="text-amber-500" size={18} />
                </div>
                <div>
                  <h4 className="text-[9px] md:text-xs font-black text-amber-500 uppercase tracking-widest leading-none">Live Capture Active</h4>
                  <p className="text-[8px] md:text-[10px] text-amber-500/60 font-medium">Finalizing archive once the game concludes.</p>
                </div>
              </div>
            )}

            {/* The Arena Layout */}
            <div className="flex flex-col xl:flex-row gap-6 md:gap-8 items-start justify-center">

              {/* Actual Board */}
              <div className="w-full max-w-[500px] shrink-0 mx-auto xl:mx-0">
                <div className="relative group bg-[#131314] p-2 md:p-3 rounded-2xl border border-white/5 shadow-2xl">
                  <div className="aspect-square">
                    <ChessBoard
                      fen={currentFen}
                      onMove={() => { }}
                      playerRole="spectator"
                    />
                  </div>
                </div>
              </div>

              {/* Side Stats Container */}
              <div className="flex-1 w-full space-y-4 md:space-y-6">
                {/* Summary Card */}
                <div className="bg-[#131314] border border-white/5 p-5 md:p-6 rounded-3xl space-y-4 md:space-y-5">
                  <div className="flex items-center justify-between text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 border-b border-white/5 pb-3">
                    <span className="leading-none">Battle Summary</span>
                    <Info size={12} />
                  </div>

                  <div className="space-y-3.5 md:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] md:text-xs text-slate-500 font-bold italic uppercase leading-none">Victor</span>
                      <span className={`text-xs md:text-sm font-black italic uppercase leading-none ${room.winner_id ? 'text-[#ba9eff]' : 'text-slate-400'}`}>
                        {winnerName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] md:text-xs text-slate-500 font-bold italic uppercase leading-none">Complexity</span>
                      <span className="text-xs md:text-sm font-black text-white italic uppercase leading-none">{moves.length} Manuevers</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] md:text-xs text-slate-500 font-bold italic uppercase leading-none">Time Expended</span>
                      <span className="text-xs md:text-sm font-black text-white italic uppercase leading-none">{duration}</span>
                    </div>
                  </div>
                </div>

                {/* Player Profile Rows */}
                <div className="space-y-2 md:space-y-3">
                   <PlayerMiniCard 
                     label="Black" 
                     username={room.black_player?.username || 'Guest'} 
                     points={room.black_player?.points || 1000} 
                   />
                   <PlayerMiniCard 
                     label="White" 
                     username={room.white_player?.username || 'Guest'} 
                     points={room.white_player?.points || 1000} 
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Move List & Replay System */}
          <div className="w-full lg:w-96 bg-[#131314] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shadow-2xl h-[400px] lg:h-auto overflow-hidden shrink-0">
            <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[10px] md:text-xs font-black text-white uppercase italic tracking-widest flex items-center gap-2 leading-none">
                <RotateCcw size={14} className="text-[#ba9eff]" />
                Tactical Annotation
              </h3>
              <span className="text-[8px] font-black text-[#ba9eff] uppercase tracking-widest px-2 py-0.5 bg-[#ba9eff]/10 rounded border border-[#ba9eff]/20">Archive</span>
            </div>

            {/* Sequential Move List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar bg-black/10">
              {moves.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                  <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">No moves logs</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {moves.map((move, i) => (
                    <button
                      key={move.id}
                      onClick={() => setCurrentIndex(i)}
                      className={`flex items-center gap-3 p-3 lg:p-4 rounded-xl border transition-all text-left ${currentIndex === i
                        ? 'bg-[#ba9eff]/10 border-[#ba9eff]/40 text-white shadow-lg shadow-[#ba9eff]/5'
                        : 'bg-white/[0.02] border-white/5 text-slate-500 hover:bg-white/5 hover:border-white/10'
                        }`}
                    >
                      <span className="text-[8px] md:text-[9px] font-mono opacity-40 shrink-0 min-w-[24px]">{Math.floor(i / 2) + 1}{i % 2 === 0 ? '.' : '...'}</span>
                      <span className="text-[11px] md:text-xs font-black uppercase italic tracking-tighter truncate overflow-hidden">{move.move_notation}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Timeline Integration Controls */}
            <div className="p-5 md:p-6 bg-[#1a1a1b]/50 border-t border-white/5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 shrink-0">
                  <ControlButton 
                    onClick={() => handleNavigate('start')} 
                    disabled={currentIndex === -1}
                    icon={<ChevronsLeft size={18} />}
                  />
                  <ControlButton 
                    onClick={() => handleNavigate('prev')} 
                    disabled={currentIndex === -1}
                    icon={<ChevronLeft size={18} />}
                  />
                </div>

                <div className="flex-1 text-center min-w-[80px]">
                  <span className="text-[9px] md:text-[10px] font-black text-white italic uppercase tracking-widest leading-none block">
                    MANEUVER
                  </span>
                  <span className="text-[11px] md:text-[12px] font-black text-[#ba9eff] tabular-nums leading-none">
                    {currentIndex + 1} <span className="text-slate-700 mx-1">/</span> {moves.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <ControlButton 
                    onClick={() => handleNavigate('next')} 
                    disabled={currentIndex === moves.length - 1}
                    icon={<ChevronRight size={18} />}
                  />
                  <ControlButton 
                    onClick={() => handleNavigate('end')} 
                    disabled={currentIndex === moves.length - 1}
                    icon={<ChevronsRight size={18} />}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}

import { ChevronsLeft, ChevronsRight } from 'lucide-react';

function ControlButton({ onClick, disabled, icon }: { onClick: () => void, disabled: boolean, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2.5 md:p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-10 transition-all active:scale-90"
    >
      {icon}
    </button>
  );
}

function PlayerMiniCard({ label, username, points }: { label: string, username: string, points: number }) {
  return (
    <div className="bg-[#131314]/50 border border-white/5 p-3 md:p-4 rounded-2xl flex items-center justify-between group hover:bg-[#131314] transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-slate-400 font-black group-hover:border-[#ba9eff]/20 transition-all shrink-0">
          {username[0]?.toUpperCase() || 'G'}
        </div>
        <div className="space-y-0.5 min-w-0">
          <span className="text-[8px] md:text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-none block">{label}</span>
          <p className="text-xs md:text-sm font-black text-white uppercase italic truncate">{username}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-3">
        <span className="text-[9px] md:text-[10px] text-[#ba9eff] font-mono font-black italic">{points} pts</span>
      </div>
    </div>
  );
}
