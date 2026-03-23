import { Trophy, Home, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameOverModalProps {
  gameOver: any;
  isWinner: boolean;
  gameOverTitle: string;
  gameOverMessage: string;
  gameOverReason: string;
  handleReturnHome: () => void;
  setGameOver: (val: any) => void;
}

export function GameOverModal({
  gameOver,
  isWinner,
  gameOverTitle,
  gameOverMessage,
  gameOverReason,
  handleReturnHome,
  setGameOver
}: GameOverModalProps) {
  return (
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
  );
}
