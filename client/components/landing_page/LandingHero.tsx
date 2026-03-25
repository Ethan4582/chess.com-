'use client'

import { motion } from 'framer-motion';
import { Sparkles, Play } from 'lucide-react';

interface HeroSectionProps {
  onPlayFriend: () => void;
  onViewGame: () => void;
}

export default function LandingHero({ onPlayFriend, onViewGame }: HeroSectionProps) {
  return (
    <section className="relative pt-[180px] pb-24 px-6 flex flex-col items-center text-center max-w-[1400px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-slate-300 text-[10px] font-bold tracking-[0.2em] uppercase"
      >
        NOW LIVE: SEASONAL TOURNAMENT
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-headline text-6xl md:text-[5.5rem] font-light tracking-tight text-white mb-6 leading-[1.05]"
      >
        Blitzr
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-slate-400 text-lg md:text-xl max-w-[600px] mb-14 font-medium leading-relaxed"
      >
        Experience the game of kings in a high-fidelity digital void. Engineered for focus, designed for victory.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-6 items-center"
      >
        <button 
          onClick={onPlayFriend}
          className="group relative px-8 py-4 bg-[#a47ff6] hover:bg-[#8e6bea] rounded-xl text-black font-bold text-[15px] overflow-hidden shadow-[0_0_40px_rgba(164,127,246,0.3)] transition-all active:scale-95 flex items-center gap-3"
        >
          Start Playing
          <Play size={14} className="fill-black" />
        </button>
        <button 
          onClick={onViewGame}
          className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white font-bold text-[15px] transition-all active:scale-95 flex items-center gap-3"
        >
          Watch Live Games
          <Sparkles size={14} className="text-[#a47ff6]" />
        </button>
      </motion.div>

      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-32 w-full max-w-[1200px] relative aspect-[16/10] overflow-hidden rounded-[40px] border border-white/5 bg-[#121213] group"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0f] via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-x from-[#0e0e0f] via-transparent to-[#0e0e0f] z-10 opacity-60" />
        <img 
          alt="Chess Board" 
          className="w-full h-full object-cover grayscale-[0.8] opacity-80 group-hover:scale-105 transition-transform duration-[15s]"
          src="https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=2071&auto=format&fit=crop"
        />
      </motion.div>
    </section>
  );
}
