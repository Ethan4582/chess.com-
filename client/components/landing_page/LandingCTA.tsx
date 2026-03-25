'use client'

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface LandingCTAProps {
  onSignUp: () => void;
}

export default function LandingCTA({ onSignUp }: LandingCTAProps) {
  return (
    <section className="py-32 px-8 max-w-screen-2xl mx-auto">
      <div className="relative overflow-hidden rounded-[48px] bg-[#1a1a1b] p-12 md:p-20 border border-white/5 group">
        {/* Background Chess Piece Decoration */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-[2s]">
          <svg
            width="400"
            height="500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M19 22H5V20H19V22Z" />
            <path d="M7 20V11H17V20" />
            <path d="M7 11V9H17V11" />
            <path d="M8 9V7H16V9" />
            <path d="M15 7C15 5.34315 13.6569 4 12 4C10.3431 4 9 5.34315 9 7" />
            <path d="M12 4V2" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl">
          <h2 className="text-5xl md:text-6xl font-headline font-black text-white mb-6 leading-tight">
            Ready to make<br />your first move?
          </h2>
          
          <p className="text-slate-400 text-lg md:text-xl font-medium mb-12 max-w-lg leading-relaxed">
            Join the elite arena today. No downloads, no lag, just pure strategy in the void.
          </p>

          <div className="flex flex-wrap items-center gap-8">
            <button 
              onClick={onSignUp}
              className="px-8 py-5 bg-[#b9a2ff] hover:bg-[#a285ff] text-[#1a1a1b] rounded-2xl font-black text-lg flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-[#b9a2ff]/10"
            >
              Launch Arena
              <ArrowRight size={22} />
            </button>

            <div className="flex flex-col">
              <span className="text-white font-black text-lg">Free Forever</span>
              <span className="text-slate-500 text-sm font-medium">Open Source Platform</span>
            </div>
          </div>
        </div>
        
        {/* Subtle Inner Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>
    </section>
  );
}
