import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Flag } from 'lucide-react';

interface AbortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AbortModal({ isOpen, onClose, onConfirm }: AbortModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-sm bg-[#131314] rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden"
          >
            {/* Background design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="p-10 flex flex-col items-center text-center space-y-8 relative z-10">
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-inner">
                 <ShieldAlert className="text-red-500" size={40} />
              </div>
              
              <div className="space-y-3">
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Abandon Match?</h2>
                 <p className="text-slate-500 text-sm leading-relaxed px-4 font-medium">
                    Leaving now will result in an immediate forfeit. Are you sure you wish to surrender?
                 </p>
              </div>

              <div className="w-full grid grid-cols-1 gap-4">
                 <button 
                   onClick={onConfirm}
                   className="w-full py-4.5 bg-red-500 hover:bg-red-600 border border-red-400/20 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-3 active:scale-95"
                 >
                    <Flag size={18} fill="currentColor" />
                    Confirm Forfeit
                 </button>
                 <button 
                   onClick={onClose}
                   className="w-full py-4.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                 >
                    Never Mind
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
