'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { supabase } from '@/lib/supabaseClient';
import ChessBoard from '@/components/ChessBoard';
import {
  ArrowLeft, Share2, Users, ShieldCheck,
  ChevronLeft, ChevronRight, AlertCircle, Eye,
  Copy, ExternalLink, Trophy, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ─── Types ───
type PlayerRole = 'w' | 'b' | 'spectator' | null;

interface GameStatus {
  is_over: boolean;
  winner: string | null;
  reason: string | null;
}

interface RoomState {
  white: string | null;
  black: string | null;
  count: number;
  status?: GameStatus;
}

interface Toast {
  id: number;
  message: string;
}

let toastCounter = 0;

export default function GamePage() {
  const { id: roomId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const socket = getSocket();

  // ─── Supabase Session ───
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const playerName = profile?.username || session?.user.email?.split('@')[0] || 'Guest';

  // ─── State ───
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [role, setRole] = useState<PlayerRole>(null);
  const [roomState, setRoomState] = useState<RoomState>({ white: null, black: null, count: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [gameOver, setGameOver] = useState<GameStatus | null>(null);

  // ─── Toast System ───
  const addToast = useCallback((message: string) => {
    const id = ++toastCounter;
    setToasts(prev => [...prev.slice(-4), { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // ─── Confetti on Win ───
  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#6366f1', '#a855f7', '#818cf8'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#6366f1', '#a855f7', '#818cf8'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  // ─── Socket Events ───
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log('DEBUG: Socket connected', socket.id);
      setIsConnected(true);
      if (typeof roomId === 'string' && roomId.length > 0) {
        // Use the authenticated playerName
        socket.emit('joinRoom', roomId, playerName);
      }
    };

    const onDisconnect = () => {
      console.log('DEBUG: Socket disconnected');
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) {
      onConnect();
    }

    socket.on('playerRole', (r: string) => {
      if (r === 'w' || r === 'b' || r === 'spectator') {
        setRole(r as PlayerRole);
      }
    });

    socket.on('spectatorRole', () => {
      setRole('spectator');
    });

    socket.on('roomState', (state: RoomState) => {
      console.log('DEBUG: Received roomState', state);
      setRoomState(state);
      if (state.status?.is_over && !gameOver) {
        setGameOver(state.status);
      }
    });

    socket.on('gameOver', (status: GameStatus) => {
      console.log('DEBUG: Received gameOver', status);
      setGameOver(status);
    });

    socket.on('updateBoard', (newFen: string) => {
      setFen(newFen);
    });

    socket.on('invalidMove', (msg: string) => {
      addToast(msg || 'Invalid move!');
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('playerRole');
      socket.off('spectatorRole');
      socket.off('roomState');
      socket.off('gameOver');
      socket.off('updateBoard');
      socket.off('invalidMove');
    };
  }, [socket, roomId, playerName, addToast, gameOver]);

  // ─── Trigger confetti when you WIN ───
  useEffect(() => {
    if (gameOver && gameOver.winner === role) {
      fireConfetti();
    }
  }, [gameOver, role, fireConfetti]);

  // ─── Handlers ───
  const handleMove = useCallback((move: { from: string; to: string; promotion: string }) => {
    if (role === 'spectator' || !role || gameOver) return;
    socket.emit('makeMove', move);
  }, [socket, role, gameOver]);

  const handleStep = useCallback((direction: 'back' | 'forward') => {
    socket.emit('stepHistory', direction);
  }, [socket]);

  const shareLink = (target: 'play' | 'watch') => {
    const baseUrl = `${window.location.origin}/game/${roomId}`;
    navigator.clipboard.writeText(baseUrl);
    addToast(`${target === 'play' ? 'Invite' : 'Spectator'} link copied!`);
  };

  const handleReturnHome = () => {
    socket.disconnect();
    router.push('/');
  };

  const isSpectator = role === 'spectator';
  const isPlayer = role === 'w' || role === 'b';
  const roleLabel = role === 'w' ? 'White' : role === 'b' ? 'Black' : 'Spectator';

  // Game over details
  const isWinner = gameOver?.winner === role;
  const isDraw = gameOver && !gameOver.winner;
  const gameOverTitle = isWinner ? 'Victory!' : isDraw ? 'Draw' : (isSpectator ? 'Game Over' : 'Defeat');
  const gameOverReason = gameOver?.reason?.replace(/_/g, ' ') || '';
  const gameOverMessage = isWinner
    ? `Checkmate! You've claimed the board.`
    : isDraw
      ? `The game ended in a ${gameOverReason}.`
      : isSpectator
        ? `The game ended by ${gameOverReason}.`
        : `You were checkmated. Better luck next time!`;

  return (
    <div className="min-h-screen bg-[#070708] text-slate-100 flex flex-col items-center py-10 px-4 md:px-8 relative overflow-hidden">
      {/* ─── Background Glows ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* ─── Toast Notifications ─── */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.9 }}
              className="px-5 py-3 glass rounded-2xl text-sm font-semibold flex items-center gap-3 text-white shadow-2xl pointer-events-auto border border-white/5"
            >
              <AlertCircle size={16} className="text-indigo-400 shrink-0" />
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ─── Header ─── */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 z-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-100 transition-colors font-semibold group"
        >
          <div className="p-2 rounded-xl bg-slate-900 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
            <ArrowLeft size={20} />
          </div>
          Exit
        </button>

        <div className="flex items-center gap-4">
          <div className="px-5 py-2 glass rounded-2xl flex items-center gap-3">
            {isSpectator ? (
              <>
                <Eye size={14} className="text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Spectating</span>
              </>
            ) : isPlayer ? (
              <>
                <div className={`w-2 h-2 rounded-full ${gameOver ? 'bg-slate-500' : 'bg-green-500 animate-pulse'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {playerName} ({roleLabel})
                </span>
              </>
            ) : (
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isConnected ? 'Assigning Role...' : 'Connecting...'}
              </span>
            )}
          </div>

          {isPlayer && !gameOver && (
            <button
              onClick={() => shareLink('play')}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-2xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Share2 size={16} />
              Copy Invite Link
            </button>
          )}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start justify-center z-10">
        <div className="flex flex-col items-center">
          <div className="relative">
            {gameOver && (
              <div className="absolute inset-0 z-20 bg-[#070708]/40 backdrop-blur-[2px] rounded-2xl pointer-events-none" />
            )}
            <ChessBoard fen={fen} onMove={handleMove} playerRole={role} />
          </div>

          {isPlayer && (
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={() => handleStep('back')}
                className="p-4 glass rounded-2xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all active:scale-90"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="px-6 py-4 glass rounded-2xl font-bold min-w-[200px] text-center border border-white/5">
                <span className="text-sm uppercase tracking-widest text-indigo-500">
                  {gameOver ? 'Match Complete' : (role === 'w' ? 'You are White' : 'You are Black')}
                </span>
              </div>
              <button
                onClick={() => handleStep('forward')}
                className="p-4 glass rounded-2xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all active:scale-90"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Game Status Card */}
          <div className="glass p-8 rounded-[40px] border border-white/5 space-y-8 shadow-2xl">
            <div className="flex items-center gap-3 text-xl font-bold">
              <ShieldCheck className="text-indigo-500" size={24} />
              Game Status
            </div>

            <div className="space-y-4">
              <div className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
                roomState.white
                  ? 'bg-white/5 border-white/10'
                  : 'bg-slate-900/30 border-dashed border-slate-800'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
                    role === 'w'
                      ? 'bg-indigo-600 text-white shadow-indigo-600/20'
                      : 'bg-white text-black shadow-white/10'
                  }`}>W</div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">White</div>
                    <div className={`font-bold text-lg ${!roomState.white ? 'text-slate-600 italic' : 'text-slate-100'}`}>
                      {roomState.white || 'Waiting...'}
                    </div>
                  </div>
                </div>
                {role === 'w' && (
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 rounded-full">You</span>
                )}
              </div>

              <div className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
                roomState.black
                  ? 'bg-white/5 border-white/10'
                  : 'bg-slate-900/30 border-dashed border-slate-800'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
                    role === 'b'
                      ? 'bg-indigo-600 text-white shadow-indigo-600/20'
                      : 'bg-slate-800 text-white border border-white/10'
                  }`}>B</div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Black</div>
                    <div className={`font-bold text-lg ${!roomState.black ? 'text-slate-600 italic' : 'text-slate-100'}`}>
                      {roomState.black || 'Waiting...'}
                    </div>
                  </div>
                </div>
                {role === 'b' && (
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 rounded-full">You</span>
                )}
              </div>
            </div>
          </div>

          {!gameOver && (
            <div className="glass p-8 rounded-[40px] border border-white/5 space-y-6">
              <div className="flex items-center gap-3 text-xl font-bold">
                <Users className="text-purple-500" size={24} />
                Share Game
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => shareLink('play')}
                  className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800 rounded-2xl text-sm font-semibold transition-all group border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Users size={16} />
                    </div>
                    Invite Friend
                  </div>
                  <Copy size={14} className="text-slate-600" />
                </button>

                <button
                  onClick={() => shareLink('watch')}
                  className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800 rounded-2xl text-sm font-semibold transition-all group border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <Eye size={16} />
                    </div>
                    Watch Link
                  </div>
                  <ExternalLink size={14} className="text-slate-600" />
                </button>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl space-y-2 border border-white/5">
                <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Room ID</div>
                <div className="font-mono text-indigo-400 select-all font-bold tracking-wider">
                  #{roomId}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Game Over Modal ─── */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#070708]/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 }}
              className="w-full max-w-md glass rounded-[48px] p-10 text-center shadow-[0_0_80px_rgba(79,70,229,0.2)] border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3, damping: 10 }}
                className={`mb-8 inline-flex items-center justify-center p-6 rounded-3xl ${
                  isWinner ? 'bg-yellow-500/10 text-yellow-400' : 'bg-indigo-600/10 text-indigo-500'
                }`}
              >
                <Trophy size={64} />
              </motion.div>
              <h2 className="text-5xl font-black mb-4 tracking-tight">
                {gameOverTitle}
              </h2>
              <p className="text-slate-400 font-medium mb-3 leading-relaxed px-4">
                {gameOverMessage}
              </p>
              {gameOverReason && (
                <div className="inline-block px-4 py-2 bg-slate-900/80 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-400 mb-8 border border-white/5">
                  {gameOverReason}
                </div>
              )}
              <div className="space-y-4 mt-4">
                <button
                  onClick={handleReturnHome}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Home size={20} />
                  Return Home
                </button>
                <button
                  onClick={() => setGameOver(null)}
                  className="w-full py-5 glass hover:bg-white/10 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all text-slate-400 hover:text-white"
                >
                  <Eye size={20} />
                  Review Board
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
