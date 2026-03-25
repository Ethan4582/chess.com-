import React, { useState } from 'react';
import { MessageSquare, X, Menu, Share2, Zap, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomControlsProps {
  onChatToggle: () => void;
  onAbort: () => void;
  onMenuToggle: () => void;
  onInvite: () => void;
  onWatch: () => void;
  role: string | null;
  isChatOpen: boolean;
}

export function BottomControls({ onChatToggle, onAbort, onMenuToggle, onInvite, onWatch, role, isChatOpen }: BottomControlsProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const isSpectator = role === 'spectator';

  return (
    <>
      {/* Share Sub-menu Overlay */}
      <AnimatePresence>
        {isShareOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-[160px] md:hidden"
          >
            <button 
              onClick={() => { onInvite(); setIsShareOpen(false); }}
              className="flex items-center gap-3 w-full p-4 bg-[#131314] hover:bg-[#ba9eff]/10 border border-white/10 rounded-2xl text-white transition-all shadow-2xl group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#ba9eff]/20 flex items-center justify-center text-[#ba9eff]">
                <Zap size={16} fill="currentColor" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider">Invite</span>
            </button>
            <button 
              onClick={() => { onWatch(); setIsShareOpen(false); }}
              className="flex items-center gap-3 w-full p-4 bg-[#131314] hover:bg-white/5 border border-white/10 rounded-2xl text-slate-300 transition-all shadow-2xl"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                <Eye size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider">Watch</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-5 pt-3 bg-[#0e0e0f]/95 backdrop-blur-3xl border-t border-white/5 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.6)] md:hidden">
        {/* Chat */}
        <button 
          onClick={onChatToggle}
          className={`flex flex-col items-center justify-center transition-all duration-200 gap-1 ${isChatOpen ? 'text-[#ba9eff]' : 'text-slate-500'}`}
        >
          <div className={`p-3 rounded-2xl mb-1 ${isChatOpen ? 'bg-[#ba9eff]/10 shadow-[inset_0_0_15px_rgba(186,158,255,0.15)]' : 'bg-white/5'} active:scale-90 transition-transform`}>
            <MessageSquare size={20} fill={isChatOpen ? 'currentColor' : 'none'} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Chat</span>
        </button>

        {/* Share Button (New) */}
        <button 
          onClick={() => setIsShareOpen(!isShareOpen)}
          className={`flex flex-col items-center justify-center transition-all duration-200 gap-1 ${isShareOpen ? 'text-[#ba9eff]' : 'text-slate-500'}`}
        >
          <div className={`p-3 rounded-2xl mb-1 ${isShareOpen ? 'bg-[#ba9eff]/10' : 'bg-white/5'} active:scale-90 transition-transform`}>
            <Share2 size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Share</span>
        </button>

        {/* Abort - Only for players */}
        {!isSpectator && (
          <button 
            onClick={onAbort}
            className="flex flex-col items-center justify-center text-slate-500 hover:text-red-500 transition-all duration-200 gap-1"
          >
            <div className="p-3 bg-white/5 rounded-2xl mb-1 active:scale-90 transition-transform">
              <X size={20} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Abort</span>
          </button>
        )}
      </nav>
    </>
  );
}
