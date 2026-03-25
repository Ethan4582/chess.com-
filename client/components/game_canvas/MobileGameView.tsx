import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import ChessBoard from '@/components/game_canvas/ChessBoard';
import { PlayerInfo } from '@/components/game_canvas/PlayerInfo';
import { RoomState, PlayerRole } from '@/types/game';

interface MobileGameViewProps {
  roomState: RoomState;
  fen: string;
  isWhiteTurn: boolean;
  disconnectTimer: number | null;
  role: PlayerRole;
  handleMove: (move: any) => void;
  onSpectatorAttempt?: () => void;
}

export function MobileGameView({ 
  roomState, fen, isWhiteTurn, disconnectTimer, role, handleMove, onSpectatorAttempt 
}: MobileGameViewProps) {
  return (
    <div className="flex md:hidden flex-col w-full h-full pb-32 overflow-y-auto no-scrollbar pt-4 px-4 gap-6 max-w-md mx-auto">
      
      <PlayerInfo 
        name={roomState.black || 'Waiting...'} 
        elo={roomState.black_elo || 1200} 
        role="b" 
        isCurrentTurn={!isWhiteTurn} 
        isCompact
      />

      
      <div className="w-full aspect-square relative drop-shadow-2xl mx-auto" style={{ touchAction: 'manipulation' }}>
        <AnimatePresence>
          {disconnectTimer !== null && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-4 px-6 py-3 bg-rose-500 rounded-xl shadow-2xl border border-rose-400/30 w-[90%]"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <WifiOff size={20} className="text-white animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Opponent Disconnected</p>
                <p className="text-lg font-black text-white font-mono">WIN IN {disconnectTimer}s</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="w-full h-full bg-[#1e1e20] rounded-2xl overflow-hidden border border-white/5 relative z-20 shadow-board">
          <ChessBoard fen={fen} onMove={handleMove} playerRole={role} />
        </div>
      </div>

      
      <PlayerInfo 
        name={roomState.white || 'Waiting...'} 
        elo={roomState.white_elo || 1200} 
        role="w" 
        isCurrentTurn={isWhiteTurn} 
        isCompact
      />
    </div>
  );
}
