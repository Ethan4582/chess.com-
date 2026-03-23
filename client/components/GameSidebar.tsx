import { Users, ShieldCheck, Copy, ExternalLink, Eye } from 'lucide-react';

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
  return (
    <div className="space-y-6">
      {/* Game Status Card */}
      <div className="glass p-8 rounded-[40px] border border-white/5 space-y-8 shadow-2xl">
        <div className="flex items-center gap-3 text-xl font-bold">
          <ShieldCheck className="text-indigo-500" size={24} />
          Game Status
        </div>

        <div className="space-y-4">
          <div className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
            roomState.white
              ? 'bg-white/5 border-white/10'
              : 'bg-slate-900/30 border-dashed border-slate-800'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
                role === 'w'
                  ? 'bg-indigo-600 text-white shadow-indigo-600/20'
                  : 'bg-white text-black shadow-white/10'
              }`}>W</div>
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">White</div>
                <div className={`font-bold text-lg ${!roomState.white ? 'text-slate-600 italic' : 'text-slate-100'}`}>
                  {roomState.white || 'Waiting...'}
                </div>
              </div>
            </div>
            {role === 'w' && (
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 rounded-full">You</span>
            )}
          </div>

          <div className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
            roomState.black
              ? 'bg-white/5 border-white/10'
              : 'bg-slate-900/30 border-dashed border-slate-800'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
                role === 'b'
                  ? 'bg-indigo-600 text-white shadow-indigo-600/20'
                  : 'bg-slate-800 text-white border border-white/10'
              }`}>B</div>
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Black</div>
                <div className={`font-bold text-lg ${!roomState.black ? 'text-slate-600 italic' : 'text-slate-100'}`}>
                  {roomState.black || 'Waiting...'}
                </div>
              </div>
            </div>
            {role === 'b' && (
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 rounded-full">You</span>
            )}
          </div>
        </div>
      </div>

      {!gameOver && (
        <div className="glass p-8 rounded-[40px] border border-white/5 space-y-6">
          <div className="flex items-center gap-3 text-xl font-bold">
            <Users className="text-purple-500" size={24} />
            Share Game
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => shareLink('play')}
              className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800 rounded-2xl text-sm font-semibold transition-all group border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <Users size={16} />
                </div>
                Invite Friend
              </div>
              <Copy size={14} className="text-slate-600" />
            </button>

            <button
              onClick={() => shareLink('watch')}
              className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800 rounded-2xl text-sm font-semibold transition-all group border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <Eye size={16} />
                </div>
                Watch Link
              </div>
              <ExternalLink size={14} className="text-slate-600" />
            </button>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl space-y-2 border border-white/5">
            <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Room ID</div>
            <div className="font-mono text-indigo-400 select-all font-bold tracking-wider">
              #{roomId}
            </div>
          </div>
        </div>
      )}

      {/* Minimal Chat UI */}
      <div className="glass p-6 rounded-[40px] border border-white/5 space-y-4 shadow-2xl flex flex-col h-[300px]">
        <div className="flex items-center gap-3 text-lg font-bold">
          Room Chat {!session && <span className="text-xs font-normal text-slate-500">(Guest Mode)</span>}
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar flex flex-col justify-end">
          {messages.length === 0 && <div className="text-slate-500 text-sm text-center">No messages yet.</div>}
          {messages.map((m, i) => (
            <div key={i} className={`text-sm ${m.isSystem ? 'text-indigo-400 italic font-medium' : 'text-slate-200'}`}>
              {!m.isSystem && <span className={`font-bold mr-2 ${m.isAuth ? 'text-indigo-300' : 'text-slate-400'}`}>{m.author}:</span>}
              {m.content}
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={session ? "Type a message..." : "Guest msg (no links allowed)..."}
            className="flex-1 bg-slate-900/80 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button disabled={!chatInput.trim()} type="submit" className="bg-indigo-600 disabled:opacity-50 px-4 py-2 rounded-xl text-sm font-bold shadow-md">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
