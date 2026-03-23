'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { supabase } from '@/lib/supabaseClient';
import ChessBoard from '@/components/ChessBoard';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

import { GameSidebar } from '@/components/GameSidebar';
import { GameOverModal } from '@/components/GameOverModal';
import { AppLayout } from '@/components/AppLayout';

// ... (keep logic above the return, adding sidebarOpen state)

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

interface ChatMessage {
  author: string;
  content: string;
  isAuth: boolean;
  isGuest: boolean;
  isSystem: boolean;
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

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
        // Use the authenticated playerName & UUID
        socket.emit('joinRoom', roomId, playerName, session?.user?.id || null);
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

    socket.on('chatMessage', (msg: ChatMessage) => {
      setMessages((prev) => [...prev.slice(-49), msg]);
    });

    socket.on('chatError', (errMsg: string) => {
      addToast(errMsg);
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
      socket.off('chatMessage');
      socket.off('chatError');
    };
  }, [socket, roomId, playerName, session?.user?.id, addToast, gameOver]);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    let guest_id = localStorage.getItem('chess_guest_id');
    if (!session && !guest_id) {
      guest_id = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chess_guest_id', guest_id);
    }

    socket.emit('chatMessage', {
      content: chatInput,
      is_auth: !!session,
      user_id: session?.user?.id,
      guest_id: guest_id,
      author_name: playerName
    });
    setChatInput('');
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
    <AppLayout isConnected={isConnected}>
      {/* ─── Background Glows ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>
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

      {/* ─── Main Content Canvas ─── */}
      <div className="w-full flex h-full">
        
        {/* Game Section (80%) */}
        <section className="flex-[8] flex flex-col items-center justify-center p-8 bg-[#0e0e0f] h-full overflow-y-auto">
          <div className="w-full max-w-[800px] flex items-center justify-center aspect-square relative group">
            <div className="absolute -inset-4 border border-white/5 rounded-2xl pointer-events-none" />
            <div className="relative z-10 w-full h-full p-2">
              <ChessBoard 
                fen={fen} 
                onMove={handleMove} 
                playerRole={role} 
                onSpectatorAttempt={() => {
                  if (!session) router.push('/login');
                }}
              />
            </div>

            {gameOver && (
              <div className="absolute inset-0 z-20 bg-[#0e0e0f]/50 backdrop-blur-[2px] rounded-2xl pointer-events-none" />
            )}
            
            {!gameOver && isPlayer && roomState.black && roomState.white && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 glass rounded-full border border-white/10 flex items-center gap-4 animate-pulse z-20">
                <span className={`w-2 h-2 rounded-full ${role === 'w' ? 'bg-white shadow-[0_0_10px_white]' : 'bg-[#ba9eff] shadow-[0_0_10px_#ba9eff]'}`} />
                <span className="text-xs font-medium tracking-widest uppercase text-white">
                  Match In Progress...
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar Controls (20%) */}
        <div className="flex-[2] bg-[#131314] flex flex-col min-w-[320px] z-20">
          <GameSidebar 
            roomState={roomState}
            role={role}
            gameOver={gameOver}
            roomId={roomId as string}
            shareLink={shareLink}
            session={session}
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleSendMessage={handleSendMessage}
          />
        </div>
        </div>

      <GameOverModal 
        gameOver={gameOver}
        isWinner={isWinner}
        gameOverTitle={gameOverTitle}
        gameOverMessage={gameOverMessage}
        gameOverReason={gameOverReason}
        handleReturnHome={handleReturnHome}
        setGameOver={setGameOver}
      />
    </AppLayout>
  );
}
