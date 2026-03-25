import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, ShieldAlert } from 'lucide-react';
import { ChatMessage } from '@/types/game';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
  session: any;
}

export function ChatDrawer({ isOpen, onClose, messages, chatInput, setChatInput, onSend, session }: ChatDrawerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-[70] h-[75vh] bg-[#1a1a1b] border-t border-white/5 rounded-t-[2.5rem] flex flex-col shadow-2xl overflow-hidden md:hidden"
      >
      
        <div className="flex flex-col items-center gap-1.5 py-4 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-white/10 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Match Chat</span>
        </div>

        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar bg-black/10"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
              <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ba9eff]">Battle for the Void ♟️</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-tight ${m.isSystem ? 'text-[#ba9eff]' : 'text-slate-500'}`}>
                    {m.author.toUpperCase()}:
                  </span>
                  <span className={`text-[11px] leading-relaxed font-medium ${m.isSystem ? 'text-[#ba9eff]/90 italic' : 'text-white/90'}`}>
                    {m.content}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      
        <div className="p-6 bg-[#0e0e0f] border-t border-white/5">
          <form onSubmit={onSend} className="relative group">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send a whisper to the masters..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 px-6 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#ba9eff]/40 transition-all pr-12"
            />
            <button 
              type="submit" 
              disabled={!chatInput.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ba9eff] hover:scale-110 active:scale-95 disabled:opacity-0 transition-all p-2 bg-[#ba9eff]/10 rounded-xl"
            >
              <Send size={18} fill="currentColor" />
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
}
