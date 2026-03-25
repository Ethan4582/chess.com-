'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { AppLayout } from '@/components/AppLayout';
import { GameOverModal } from '@/components/game_canvas/GameOverModal';
import { BottomControls } from '@/components/game_canvas/BottomControls';
import { ChatDrawer } from '@/components/game_canvas/ChatDrawer';
import { SidebarDrawer } from '@/components/game_canvas/SidebarDrawer';
import { AbortModal } from '@/components/game_canvas/AbortModal';
import { MobileGameView } from '@/components/game_canvas/MobileGameView';
import { DesktopGameView } from '@/components/game_canvas/DesktopGameView';
import { useToast } from '@/hooks/useToast';
import { useChessGame } from '@/hooks/useChessGame';
import { PlayerRole, RoomState, GameStatus, ChatMessage } from '@/types/game';
import { AlertCircle } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamePage() {
  const { id: roomId } = useParams();
  const router = useRouter();
  const socket = getSocket();
  const { toasts, addToast } = useToast();

  // ─── Auth State ───
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [guestSuffix, setGuestSuffix] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setGuestSuffix(Math.floor(1000 + Math.random() * 9000));
  }, []);
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => data && setProfile(data));
      }
    });
  }, []);

  const playerName = profile?.username || session?.user.email?.split('@')[0] || `Guest-${guestSuffix}`;

  // ─── Game Hook ───
  const {
    fen, role, roomState, isConnected, gameOver, messages, 
    disconnectTimer, handleMove, setGameOver, setFen
  } = useChessGame(roomId as string, playerName, session, addToast);

  // ─── Local UI State ───
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false);

  // ─── Chat Logic ───
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
    if (!session) { router.push('/login'); return; }
    const { data, error } = await supabase.from('rooms').insert({ white_player_id: session.user.id, status: 'waiting' }).select().single();
    if (error) addToast(`Error: ${error.message}`);
    else window.location.href = `/game/${data.id}`;
  };

  const isWinner = gameOver?.winner === (role === 'w' ? 'w' : 'b');
  const isWhiteTurn = fen.split(' ')[1] === 'w';

  // ─── Navigation Guard ───
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (!gameOver && role && role !== 'spectator') {
        e.preventDefault(); e.returnValue = 'Forfeit check?';
      }
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [gameOver, role]);

  return (
    <AppLayout 
      isConnected={isConnected} role={role} disconnectTimer={disconnectTimer}
      onInvite={() => { navigator.clipboard.writeText(`${window.location.origin}/game/${roomId}`); addToast(`Invite link copied! ♟️`); }}
      onWatch={() => { navigator.clipboard.writeText(`${window.location.origin}/game/${roomId}`); addToast(`Spectator link copied! 👁️`); }}
      roomName="Grandmaster's Void"
    >
      <div className="flex flex-1 w-full h-full relative overflow-hidden bg-[#0a0a0b]">
        <MobileGameView 
          roomState={roomState} fen={fen} isWhiteTurn={isWhiteTurn} 
          disconnectTimer={disconnectTimer} role={role} handleMove={handleMove} 
          onSpectatorAttempt={() => !session && router.push('/login')}
        />

        <DesktopGameView 
          roomState={roomState} fen={fen} role={role} gameOver={gameOver} 
          roomId={roomId as string} session={session} messages={messages} 
          chatInput={chatInput} setChatInput={setChatInput} handleSendMessage={handleSendMessage} 
          handleMove={handleMove} disconnectTimer={disconnectTimer} addToast={addToast}
          onSpectatorAttempt={() => !session && router.push('/login')}
        />

        <BottomControls 
          role={role} isChatOpen={isChatOpen}
          onChatToggle={() => setIsChatOpen(true)} onAbort={() => setIsAbortModalOpen(true)} 
          onMenuToggle={() => setIsMenuOpen(true)}
          onInvite={() => { navigator.clipboard.writeText(`${window.location.origin}/game/${roomId}`); addToast(`Invite link copied! ♟️`); }}
          onWatch={() => { navigator.clipboard.writeText(`${window.location.origin}/game/${roomId}`); addToast(`Watch link copied! 👁️`); }}
        />
        
        <ChatDrawer 
          isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} 
          messages={messages} chatInput={chatInput} setChatInput={setChatInput} 
          onSend={handleSendMessage} session={session} 
        />

        <SidebarDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} playerName={playerName} />
        <AbortModal isOpen={isAbortModalOpen} onClose={() => setIsAbortModalOpen(false)} onConfirm={() => { socket.emit('abortGame'); setIsAbortModalOpen(false); }} />

        {/* Toasts */}
        <div className="fixed top-20 right-6 z-[110] flex flex-col items-end gap-3 pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="px-5 py-3 bg-[#1e1e20] rounded-2xl text-xs font-black text-white shadow-2xl pointer-events-auto border border-white/10 flex items-center gap-3 tracking-wide">
                <AlertCircle size={14} className="text-[#ba9eff]" /> {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <GameOverModal
        gameOver={gameOver} isWinner={isWinner}
        gameOverTitle={gameOver?.winner === (role === 'w' ? 'w' : 'b') ? 'Victory!' : 'Game Over'}
        gameOverMessage={gameOver?.reason || 'The match has concluded.'}
        gameOverReason={gameOver?.reason || ''}
        handleReturnHome={() => router.push('/lobby')}
        onStartNewGame={handleStartNewGame}
        setGameOver={setGameOver}
        eloChange={25}
        role={role}
      />
    </AppLayout>
  );
}
