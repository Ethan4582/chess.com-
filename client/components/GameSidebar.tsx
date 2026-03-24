import { Share2, Eye, MessageSquare, Send, Trophy } from 'lucide-react';

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
  
  // Dynamic Elo if we have them in the room state or profile data
  // For now, if unknown, use 1200 as base
  const whiteElo = roomState.player_ids?.white ? (roomState.white_elo || 1200) : '--';
  const blackElo = roomState.player_ids?.black ? (roomState.black_elo || 1200) : '--';

  return (
    <aside className="flex flex-col bg-[#131314] h-full overflow-hidden shadow-2xl">
      {/* Header Actions */}
      <div className="p-4 flex flex-col gap-3 border-b border-white/5">
        {role === 'spectator' && (
          <div className="flex items-center gap-3 px-3 py-2 bg-[#ba9eff]/10 border border-[#ba9eff]/20 rounded-lg">
             <Eye size={12} className="text-[#ba9eff] animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ba9eff]">Spectating Match</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => shareLink('play')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#ba9eff] text-black text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#ba9eff]/10 hover:bg-[#c0a6ff]"
          >
            <Share2 size={14} />
            Invite
          </button>
          <button 
            onClick={() => shareLink('watch')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            <Eye size={14} />
            Watch
          </button>
        </div>
      </div>

      {/* Player Section */}
      <div className="p-4 flex flex-col gap-2 bg-[#1a1a1b]/50 border-b border-white/5">
        {/* Opponent Row */}
        <div className={`p-3 rounded-xl transition-all border ${role === 'b' ? 'bg-[#201f21] border-[#ba9eff]/20' : 'bg-transparent border-transparent opacity-80'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10 text-[#ba9eff] font-black text-[10px]">
                {blackName[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black text-white truncate max-w-[120px]">{blackName}</p>
                <div className="flex items-center gap-1.5 opacity-60">
                   <Trophy size={8} className="text-[#ba9eff]" />
                   <span className="text-[8px] font-black uppercase tracking-tighter">ELO {blackElo} • Black</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-white opacity-40">10:00</span>
            </div>
          </div>
        </div>

        {/* User Row (White/You) */}
        <div className={`p-3 rounded-xl transition-all border ${role === 'w' ? 'bg-[#201f21] border-[#ba9eff]/20' : 'bg-transparent border-transparent opacity-80'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10 text-[#ba9eff] font-black text-[10px]">
                {whiteName[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black text-white truncate max-w-[120px]">{whiteName}</p>
                <div className="flex items-center gap-1.5 opacity-60">
                   <Trophy size={8} className="text-[#ba9eff]" />
                   <span className="text-[8px] font-black uppercase tracking-tighter">ELO {whiteElo} • White</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-white">10:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#131314]">
        <div className="px-4 py-3 flex items-center justify-between bg-white/[0.02] border-b border-white/5 shrink-0">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Live Room Chat</h3>
          <MessageSquare size={12} className="text-slate-500" />
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 p-4 custom-scrollbar bg-black/10">
          {messages.length === 0 && (
            <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest text-center mt-8 opacity-40">
              Grandmaster Arena ♟️
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className="flex gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="flex-1">
                <p className="text-[11px] leading-relaxed">
                  <span className={`font-black tracking-tight mr-1.5 ${m.isSystem ? 'text-[#ba9eff]' : 'text-white'}`}>
                    {m.author.toUpperCase()}
                  </span> 
                  <span className={`${m.isSystem ? 'text-[#ba9eff]/70 italic' : 'text-slate-400 font-medium'}`}>
                    {m.content}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-[#1a1a1b] border-t border-white/5 shrink-0">
          <form onSubmit={handleSendMessage} className="relative group">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 px-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#ba9eff]/40 transition-all pr-10"
            />
            <button 
              type="submit" 
              disabled={!chatInput.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#ba9eff] hover:scale-110 disabled:opacity-0 transition-all p-1"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
