import { ArrowLeft, Share2, Eye } from 'lucide-react';

interface GameHeaderProps {
  router: any;
  isSpectator: boolean;
  isPlayer: boolean;
  gameOver: any;
  playerName: string;
  roleLabel: string;
  isConnected: boolean;
  shareLink: (target: 'play' | 'watch') => void;
}

export function GameHeader({
  router,
  isSpectator,
  isPlayer,
  gameOver,
  playerName,
  roleLabel,
  isConnected,
  shareLink
}: GameHeaderProps) {
  return (
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
  );
}
