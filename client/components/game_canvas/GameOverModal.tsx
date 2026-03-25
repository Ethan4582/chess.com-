import { Trophy, Home, Eye, Play, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameOverModalProps {
  gameOver: any;
  isWinner: boolean;
  gameOverTitle: string;
  gameOverMessage: string;
  gameOverReason: string;
  handleReturnHome: () => void;
  onStartNewGame: () => void;
  setGameOver: (val: any) => void;
  eloChange?: number;
  role?: 'w' | 'b' | 'spectator' | null;
}

export function GameOverModal({
  gameOver,
  isWinner,
  gameOverTitle,
  gameOverMessage,
  gameOverReason,
  handleReturnHome,
  onStartNewGame,
  setGameOver,
  eloChange = 25,
  role
}: GameOverModalProps) {
  const isSpectator = role === 'spectator';
  
  // Decide which ELO to show
  const displayElo = isWinner 
    ? `+${eloChange}` 
    : (gameOverReason?.toLowerCase().includes('abort') || gameOver?.winner !== null ? `-${Math.abs(eloChange)}` : '0');

  // Spectator Title
  const specTitle = gameOver?.winner === 'w' ? 'White won!' : gameOver?.winner === 'b' ? 'Black won!' : 'Draw Match';

  return (
    <AnimatePresence>
      {gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#070708]/95 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="w-full max-w-sm bg-[#131314] rounded-2xl p-10 text-center shadow-2xl border border-white/5 relative overflow-hidden"
          >
            
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isWinner ? 'bg-emerald-500' : isSpectator ? 'bg-[#ba9eff]' : 'bg-rose-500'}`} />
            
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2, damping: 12 }}
              className={`mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full mx-auto ${
                isWinner || isSpectator ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}
            >
              {isWinner || isSpectator ? <Trophy size={48} strokeWidth={2.5} /> : <Home size={40} strokeWidth={2.5} />}
            </motion.div>

            <div className="space-y-4 mb-10">
              <h2 className="text-4xl font-black italic uppercase tracking-tight text-white leading-none">
                {isSpectator ? specTitle : gameOverTitle}
              </h2>
              
              {!isSpectator && (
                <div className="space-y-1">
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                     {gameOverReason || 'MATCH CONCLUDED'}
                   </p>
                   <div className={`text-2xl font-black font-mono tracking-tighter ${isWinner ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {displayElo} ELO
                   </div>
                </div>
              )}

              {isSpectator && (
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic pt-2">
                   Winner: {gameOver?.winner === 'w' ? 'White' : 'Black'}
                </p>
              )}

              <p className="text-slate-400 font-medium text-sm leading-relaxed px-2">
                {isSpectator ? "The match has reached its resolution. Ready to jump into the action yourself?" : gameOverMessage}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {isSpectator ? (
                /* Spectator CTA: Join the game */
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full py-4 bg-[#ba9eff] text-black rounded-lg font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#ba9eff]/10 hover:translate-y-[-2px] active:translate-y-[1px] transition-all"
                >
                  <LogIn size={14} fill="currentColor" />
                  Join the Battle
                </button>
              ) : (
                /* Player CTA: Start New Game */
                <button
                  onClick={onStartNewGame}
                  className="w-full py-4 bg-[#ba9eff] text-black rounded-lg font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#ba9eff]/10 hover:translate-y-[-2px] active:translate-y-[1px] transition-all"
                >
                  <Play size={14} fill="currentColor" />
                  Start New Game
                </button>
              )}
              
              <button
                onClick={handleReturnHome}
                className="w-full py-4 bg-white/[0.03] text-slate-500 hover:text-white rounded-lg font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 border border-white/5 hover:bg-white/5 transition-all"
              >
                <Home size={14} />
                Return Home
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
