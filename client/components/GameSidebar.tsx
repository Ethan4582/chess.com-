import { Share2, Eye, MessageSquare, Send } from 'lucide-react';

interface GameSidebarProps {
  roomState: any;
  role: string | null;
  gameOver: any;
  roomId: string | string[];
  shareLink: (target: 'play' | 'watch') => void;
  session: any;
  messages: any[];
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
}

export function GameSidebar({
  roomState,
  role,
  gameOver,
  roomId,
  shareLink,
  session,
  messages,
  chatInput,
  setChatInput,
  handleSendMessage
}: GameSidebarProps) {
  const whiteName = roomState.white || 'Waiting...';
  const blackName = roomState.black || 'Waiting...';

  return (
    <aside className="flex flex-col border-l border-white/5 bg-[#131314] h-full min-h-[600px] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Actions */}
      <div className="p-6 grid grid-cols-2 gap-3">
        <button 
          onClick={() => shareLink('play')}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-br from-[#a27cff] to-[#ba9eff] text-[#39008c] text-sm font-bold transition-transform active:scale-95 shadow-lg shadow-[#ba9eff]/10"
        >
          <Share2 size={18} />
          Invite
        </button>
        <button 
          onClick={() => shareLink('watch')}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 text-white text-sm font-bold hover:bg-[#201f21] transition-colors"
        >
          <Eye size={18} />
          Watch
        </button>
      </div>

      {/* Player Info Cards */}
      <div className="px-6 flex flex-col gap-4 mb-8">
        {/* Player Black (Opponent) */}
        <div className={`p-4 rounded-xl bg-[#201f21] flex items-center justify-between border ${role === 'b' ? 'border-l-4 border-[#ba9eff]' : 'border-transparent'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#262627] overflow-hidden shrink-0">
              <img alt="Player" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white tracking-tight truncate">{blackName}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold truncate">Elo 2840 • Black</p>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 pl-2">
            <span className="text-xs font-mono text-[#ba9eff]">10:00</span>
            <span className="text-[10px] text-[#ba9eff]/60 uppercase font-black">{role === 'b' ? 'You' : 'Thinking'}</span>
          </div>
        </div>

        {/* Player White (You/Other) */}
        <div className={`p-4 rounded-xl bg-[#262627] flex items-center justify-between border ${role === 'w' ? 'border-l-4 border-[#ba9eff]' : 'border-transparent'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#131314] overflow-hidden shrink-0">
              <img alt="Player" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white tracking-tight truncate">{whiteName}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold truncate">Elo 2450 • White</p>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 pl-2">
            <span className="text-xs font-mono text-white">10:00</span>
            <span className="text-[10px] text-slate-400 uppercase font-black">{role === 'w' ? 'You' : 'Waiting'}</span>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-grow flex flex-col overflow-hidden px-6 pb-6 h-64">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Room Chat</h3>
          <MessageSquare size={14} className="text-slate-400" />
        </div>
        
        <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-slate-500 text-xs italic text-center mt-4">
              Welcome to the Grandmaster Arena.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded bg-[#262627] shrink-0 font-bold text-[10px] flex items-center justify-center text-[#ba9eff]">
                {m.author.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-[11px] leading-snug break-words">
                  <span className={`font-bold mr-1 ${m.isSystem ? 'text-[#ba9eff]' : m.isAuth ? 'text-white' : 'text-slate-400'}`}>
                    {m.author}
                  </span> 
                  <span className={m.isSystem ? 'text-[#ba9eff]/80 italic' : 'text-slate-300'}>
                    {m.content}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="mt-auto relative shrink-0">
          <form onSubmit={handleSendMessage} className="w-full relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={session ? "Send a message..." : "Guest msg (no links)..."}
              className="w-full bg-[#201f21] border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ba9eff] transition-all pr-12"
            />
            <button 
              type="submit" 
              disabled={!chatInput.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ba9eff] hover:text-[#c08cf7] disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
