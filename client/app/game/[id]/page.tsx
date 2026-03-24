'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { supabase } from '@/lib/supabaseClient';
import ChessBoard from '@/components/ChessBoard';
import { AlertCircle, WifiOff, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Chess } from 'chess.js';

import { GameSidebar } from '@/components/GameSidebar';
import { GameOverModal } from '@/components/GameOverModal';
import { AppLayout } from '@/components/AppLayout';

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
  const router = useRouter();
  const socket = getSocket();

  // ─── Auth State ───
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

  // ─── Guest Persistence ───
  const [guestSuffix] = useState(() => Math.floor(1000 + Math.random() * 9000));
  const [guestId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('blitzr_guest_id');
      if (!id) {
        id = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('blitzr_guest_id', id);
      }
      return id;
    }
    return '';
  });

  const playerName = profile?.username || session?.user.email?.split('@')[0] || `Guest-${guestSuffix}`;

  // ─── Game State ───
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [role, setRole] = useState<PlayerRole>(null);
  const [roomState, setRoomState] = useState<RoomState>({ white: null, black: null, count: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [gameOver, setGameOver] = useState<GameStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Disconnect Handling
  const [disconnectTimer, setDisconnectTimer] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Toast System ───
  const addToast = useCallback((message: string) => {
    const id = ++toastCounter;
    setToasts(prev => [...prev.slice(-4), { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ba9eff', '#6366f1', '#ffffff']
    });
  }, []);

  // ─── Navigation Guard ───
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!gameOver && role && role !== 'spectator') {
        e.preventDefault();
        e.returnValue = 'In battle! Abandoning now will forfeit ELO points.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameOver, role]);

  // ─── Socket / Persistence ───
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onConnect = () => {
      setIsConnected(true);
      socket.emit('joinRoom', roomId, playerName, session?.user?.id || null);
    };

    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    if (socket.connected) onConnect();

    socket.on('playerRole', (r: string) => setRole(r as PlayerRole));
    socket.on('roomState', (state: RoomState) => {
      setRoomState(state);
      if (state.status?.is_over && !gameOver) setGameOver(state.status);
    });
    socket.on('gameOver', (status: GameStatus) => {
      setGameOver(status);
      setDisconnectTimer(null); // Clear timer on game over
    });
    socket.on('updateBoard', (newFen: string) => setFen(newFen));
    socket.on('invalidMove', (msg: string) => addToast(msg));
    socket.on('chatMessage', (msg: ChatMessage) => setMessages((prev) => [...prev.slice(-49), msg]));

    socket.on('playerDisconnected', (data) => {
        setDisconnectTimer(data.timeout);
    });
    socket.on('playerReconnected', (data) => {
        setDisconnectTimer(null);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('playerRole');
      socket.off('roomState');
      socket.off('gameOver');
      socket.off('updateBoard');
      socket.off('chatMessage');
      socket.off('playerDisconnected');
      socket.off('playerReconnected');
    };
  }, [socket, roomId, playerName, session, gameOver, addToast, role]);

  // Timer Countdown Logic
  useEffect(() => {
    if (disconnectTimer !== null && disconnectTimer > 0) {
        timerRef.current = setInterval(() => {
            setDisconnectTimer(prev => (prev && prev > 0 ? prev - 1 : 0));
        }, 1000);
    } else if (disconnectTimer === 0) {
        setDisconnectTimer(null);
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [disconnectTimer]);

  useEffect(() => {
    const pRole = role === 'w' ? 'w' : 'b';
    if (gameOver && gameOver.winner === pRole) fireConfetti();
  }, [gameOver, role, fireConfetti]);

  const handleMove = useCallback((move: { from: string; to: string; promotion: string }) => {
    if (role === 'spectator' || !role || gameOver) return;
    try {
      const chess = new Chess(fen);
      const result = chess.move(move);
      if (result) {
        setFen(chess.fen());
        socket.emit('makeMove', move);
      }
    } catch (e) {
      addToast('Invalid move');
    }
  }, [socket, role, gameOver, fen, addToast]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit('chatMessage', {
      content: chatInput,
      is_auth: !!session,
      user_id: session?.user?.id,
      guest_id: !session ? guestId : null,
      author_name: playerName
    });
    setChatInput('');
  };

  const handleStartNewGame = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          white_player_id: session.user.id,
          status: 'waiting'
        })
        .select()
        .single();
      
      if (error) throw error;
      window.location.href = `/game/${data.id}`;
    } catch (err: any) {
      addToast(`Failed to start game: ${err.message}`);
    }
  };

  const isWinner = gameOver?.winner === (role === 'w' ? 'w' : 'b');

  return (
    <AppLayout isConnected={isConnected} role={role} disconnectTimer={disconnectTimer}>
      <div className="flex flex-1 w-full h-full relative overflow-hidden">
        
        {/* Center Section: Responsive Chessboard Area */}
        <section className="flex-1 flex flex-col items-center justify-center p-4 min-w-0 transition-all duration-300">
          <div className="w-full h-full max-w-[85vh] max-h-[85vh] flex items-center justify-center aspect-square relative drop-shadow-2xl">
            
            {/* Disconnect Alert Overlay */}
            <AnimatePresence>
               {disconnectTimer !== null && (
                 <motion.div 
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute top-8 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-4 px-6 py-3 bg-rose-500 rounded-xl shadow-2xl shadow-rose-500/20 border border-rose-400/30"
                 >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                       <WifiOff size={20} className="text-white animate-pulse" />
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/80 leading-tight">Opponent Disconnected</p>
                       <p className="text-lg font-black text-white leading-none font-mono">
                          WIN IN {disconnectTimer}s
                       </p>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="w-full h-full p-0 flex items-center justify-center bg-[#1e1e20] rounded-lg overflow-hidden border border-white/5 relative z-10 shadow-board">
              <ChessBoard 
                fen={fen} 
                onMove={handleMove} 
                playerRole={role} 
                onSpectatorAttempt={() => !session && router.push('/login')}
              />
            </div>
          </div>
        </section>

        {/* Right Section: Fixed Controls Panel */}
        <aside className="w-[320px] shrink-0 bg-[#131314] border-l border-white/5 flex flex-col z-10 shadow-2xl overflow-hidden">
          <GameSidebar 
            roomState={roomState} role={role} gameOver={gameOver} roomId={roomId as string}
            shareLink={() => {
              navigator.clipboard.writeText(`${window.location.origin}/game/${roomId}`);
              addToast(`Link copied!`);
            }}
            session={session} messages={messages} chatInput={chatInput} setChatInput={setChatInput}
            handleSendMessage={handleSendMessage}
          />
        </aside>

        {/* Toast Layer */}
        <div className="fixed top-20 right-6 z-[110] flex flex-col items-end gap-3 pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="px-5 py-3 bg-[#1e1e20] rounded-2xl text-xs font-black text-white shadow-2xl pointer-events-auto border border-white/10 flex items-center gap-3 tracking-wide"
              >
                <AlertCircle size={14} className="text-[#ba9eff]" />
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <GameOverModal 
        gameOver={gameOver}
        isWinner={isWinner}
        gameOverTitle={gameOver?.winner === (role === 'w' ? 'w' : 'b') ? 'Victory!' : 'Game Over'}
        gameOverMessage={gameOver?.reason || 'The match has concluded.'}
        gameOverReason={gameOver?.reason || ''}
        handleReturnHome={() => router.push('/dashboard')}
        onStartNewGame={handleStartNewGame}
        setGameOver={setGameOver}
        eloChange={25}
        role={role}
      />
    </AppLayout>
  );
}
