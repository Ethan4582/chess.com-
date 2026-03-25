import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import ChessBoard from '@/components/game_canvas/ChessBoard';
import { GameSidebar } from '@/components/game_canvas/GameSidebar';
import { RoomState, PlayerRole, GameStatus, ChatMessage } from '@/types/game';

interface DesktopGameViewProps {
  roomState: RoomState;
  fen: string;
  role: PlayerRole;
  gameOver: GameStatus | null;
  roomId: string;
  session: any;
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendMessage: (e: any) => void;
  handleMove: (move: any) => void;
  disconnectTimer: number | null;
  addToast: (msg: string) => void;
  onSpectatorAttempt: () => void;
}

export function DesktopGameView({ 
  roomState, fen, role, gameOver, roomId, session, messages, 
  chatInput, setChatInput, handleSendMessage, handleMove, 
  disconnectTimer, addToast, onSpectatorAttempt
}: DesktopGameViewProps) {
  return (
    <div className="hidden md:flex flex-1 w-full h-full relative overflow-hidden">
      <section className="flex-1 flex flex-col items-center justify-center p-4 min-w-0 transition-all duration-300">
        <div className="w-full h-full max-w-[85vh] max-h-[85vh] flex items-center justify-center aspect-square relative drop-shadow-2xl">
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
                  <p className="text-lg font-black text-white leading-none font-mono">WIN IN {disconnectTimer}s</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full h-full p-0 flex items-center justify-center bg-[#1e1e20] rounded-lg overflow-hidden border border-white/5 relative z-10 shadow-board">
            <ChessBoard
              fen={fen}
              onMove={handleMove}
              playerRole={role}
              onSpectatorAttempt={onSpectatorAttempt}
            />
          </div>
        </div>
      </section>

      <aside className="w-[320px] shrink-0 bg-[#131314] border-l border-white/5 flex flex-col z-10 shadow-2xl overflow-hidden">
        <GameSidebar
          roomState={roomState} role={role} gameOver={gameOver} roomId={roomId}
          shareLink={() => {
            navigator.clipboard.writeText(`${window.location.origin}/game/${roomId}`);
            addToast(`Link copied!`);
          }}
          session={session} messages={messages} chatInput={chatInput} setChatInput={setChatInput}
          handleSendMessage={handleSendMessage}
        />
      </aside>
    </div>
  );
}
