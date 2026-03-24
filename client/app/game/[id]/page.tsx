'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { supabase } from '@/lib/supabaseClient';
import ChessBoard from '@/components/ChessBoard';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Chess } from 'chess.js';

import { GameSidebar } from '@/components/GameSidebar';
import { GameOverModal } from '@/components/GameOverModal';
import { AppLayout } from '@/components/AppLayout';

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

  const playerName = profile?.username || session?.user.email?.split('@')[0] || 'Guest';

  // ─── Game State ───
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

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ba9eff', '#6366f1', '#ffffff']
    });
  }, []);

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
    socket.on('gameOver', (status: GameStatus) => setGameOver(status));
    socket.on('updateBoard', (newFen: string) => setFen(newFen));
    socket.on('invalidMove', (msg: string) => addToast(msg));
    socket.on('chatMessage', (msg: ChatMessage) => setMessages((prev) => [...prev.slice(-49), msg]));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('playerRole');
      socket.off('roomState');
      socket.off('gameOver');
      socket.off('updateBoard');
      socket.off('chatMessage');
    };
  }, [socket, roomId, playerName, session, gameOver, addToast]);

  useEffect(() => {
    if (gameOver && gameOver.winner === (role === 'w' ? 'w' : 'b')) fireConfetti();
  }, [gameOver, role, fireConfetti]);

  // ─── Optimistic Handlers ───
  const handleMove = useCallback((move: { from: string; to: string; promotion: string }) => {
    if (role === 'spectator' || !role || gameOver) return;

    // OPTIMISTIC UPDATE: Instant feedback for the player
    try {
      const chess = new Chess(fen);
      const result = chess.move(move);
      if (result) {
        setFen(chess.fen()); // Update local state immediately
        socket.emit('makeMove', move); // Send to backend for validation and persistence
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
      author_name: playerName
    });
    setChatInput('');
  };

  const isWinner = gameOver?.winner === (role === 'w' ? 'w' : 'b');

  return (
    <AppLayout isConnected={isConnected}>
      {/* ─── Flexible 3-Column Feel (Layout Fix) ─── */}
      <div className="flex flex-1 w-full h-full relative overflow-hidden">
        
        {/* Center Section: Responsive Chessboard Area */}
        <section className="flex-1 flex flex-col items-center justify-center p-4 min-w-0 transition-all duration-300">
          <div className="w-full h-full max-w-[85vh] max-h-[85vh] flex items-center justify-center aspect-square relative drop-shadow-2xl">
            <div className="w-full h-full p-0 flex items-center justify-center bg-[#1e1e20] rounded-lg overflow-hidden border border-white/5 relative z-10 shadow-board">
              <ChessBoard 
                fen={fen} 
                onMove={handleMove} 
                playerRole={role} 
                onSpectatorAttempt={() => !session && router.push('/login')}
              />
            </div>
            
            {/* Status Overlays */}
            <AnimatePresence>
              {!gameOver && isConnected && roomState.black && roomState.white && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#ba9eff]/10 backdrop-blur-md rounded-full border border-[#ba9eff]/20 flex items-center gap-3 z-20 pointer-events-none"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ba9eff] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#ba9eff]">Match Active</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Right Section: Fixed Controls Panel */}
        <aside className="w-[320px] shrink-0 bg-[#131314] border-l border-white/5 flex flex-col z-10 shadow-2xl overflow-hidden">
          <GameSidebar 
            roomState={roomState}
            role={role}
            gameOver={gameOver}
            roomId={roomId as string}
            shareLink={(t) => {
              navigator.clipboard.writeText(`${window.location.origin}/game/${roomId}`);
              addToast(`Link copied!`);
            }}
            session={session}
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
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
        gameOverTitle={gameOver?.winner === role ? 'Victory!' : 'Game Over'}
        gameOverMessage={gameOver?.reason || 'The match has concluded.'}
        gameOverReason={gameOver?.reason || ''}
        handleReturnHome={() => router.push('/dashboard')}
        setGameOver={setGameOver}
      />
    </AppLayout>
  );
}
