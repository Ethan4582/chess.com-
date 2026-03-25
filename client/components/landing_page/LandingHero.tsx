'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play } from 'lucide-react';

interface HeroSectionProps {
  onPlayFriend: () => void;
  onViewGame: () => void;
}

const VIDEO_URL = "https://pub-4b0a8f18a97e4b44914872dd0d22870b.r2.dev/blog_demo/chess_demo_compress.mp4";

export default function LandingHero({ onPlayFriend, onViewGame }: HeroSectionProps) {
  const [videoSrc, setVideoSrc] = useState<string>(VIDEO_URL);

  useEffect(() => {
    // Client-side caching: Fetch video as a blob to ensure it's fully cached by the browser
    const cacheVideo = async () => {
      try {
        const response = await fetch(VIDEO_URL);
        if (!response.ok) throw new Error('Video fetch failed');
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setVideoSrc(objectUrl);
      } catch (error) {
        console.warn('Video caching failed, falling back to network stream:', error);
      }
    };

    cacheVideo();

    return () => {
      // Cleanup object URL to prevent memory leaks
      if (videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, []);

  return (
    <section className="relative pt-[120px] pb-24 px-6 flex flex-col items-center text-center max-w-[1400px] mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-headline text-5xl md:text-[5rem] font-black tracking-tight text-white mb-6 leading-[1.05]"
      >
        Chess at the <br className="hidden md:block" /> 
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 italic">Speed of Thought.</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-slate-400 text-lg md:text-xl max-w-[600px] mb-12 font-medium leading-relaxed"
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
        className="mt-16 w-full max-w-[1200px] relative aspect-video md:aspect-[14/9] overflow-hidden rounded-[24px] md:rounded-[40px] border border-white/5 bg-[#121213] group shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0f] via-transparent to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-x from-[#0e0e0f] via-transparent to-[#0e0e0f] z-10 opacity-60 pointer-events-none" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
            <Play size={32} className="ml-1 fill-white" />
          </div>
        </div>

        <video 
          key={videoSrc}
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
          className="w-full h-full object-cover grayscale-[0.5] opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-[10s]"
          poster="/assets/lobby.png"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </motion.div>
    </section>
  );
}
