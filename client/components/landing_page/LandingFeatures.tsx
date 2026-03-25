'use client'

import { ShieldCheck, Target, Sparkles, Trophy, Focus, Clock, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingFeatures() {
  return (
    <section className="py-40 px-8 max-w-[1400px] mx-auto">
      <div className="mb-20">
        <h2 className="text-4xl md:text-5xl font-headline font-black text-white mb-6">Engineered for Grandmasters</h2>
        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">Everything you need to play fast, analyze deeply, and dominate the ranks securely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Feature 1 */}
        <div className="md:col-span-2 relative overflow-hidden p-12 rounded-[32px] bg-[#121213] border border-white/5 hover:border-white/10 transition-colors group min-h-[400px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#b9a2ff]/10 via-transparent to-transparent opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 max-w-lg mt-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10">
              <Sparkles className="text-[#b9a2ff]" size={24} />
            </div>
            <h3 className="text-3xl font-black text-white mb-4">Zero-Latency Infrastructure</h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              Every millisecond counts in a bullet match. Our global edge network ensures your moves register instantly, no matter where you or your opponent are located.
            </p>
          </div>
          
          {/* Decorative graphic */}
          <div className="absolute right-0 bottom-0 opacity-20 translate-x-1/4 translate-y-1/4 group-hover:opacity-40 transition-opacity duration-700 delay-100">
            <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-[#b9a2ff]">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        </div>

        {/* Tall Feature 2 */}
        <div className="relative overflow-hidden p-12 rounded-[32px] bg-[#121213] border border-white/5 hover:border-white/10 transition-colors group flex flex-col justify-between">
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10">
              <ShieldCheck className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">Clinical Fair Play</h3>
            <p className="text-slate-400 leading-relaxed mb-12">
              Advanced proprietary engine analysis monitors every move in real-time. Cheaters are instantly banned. The arena remains pure.
            </p>
          </div>
        </div>

        {/* Small Feature 3 */}
        <div className="relative overflow-hidden p-10 rounded-[32px] bg-[#121213] border border-white/5 hover:border-white/10 transition-colors group flex flex-col justify-between">
          <div className="relative z-10">
            <Focus className="text-blue-400 mb-6" size={28} />
            <h3 className="text-xl font-black text-white mb-3">Minimalist HUD</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Distraction-free environment. Just you, the board, and the clock.</p>
          </div>
        </div>

        {/* Small Feature 4 */}
        <div className="relative overflow-hidden p-10 rounded-[32px] bg-[#121213] border border-white/5 hover:border-white/10 transition-colors group flex flex-col justify-between">
          <div className="relative z-10">
            <Target className="text-rose-400 mb-6" size={28} />
            <h3 className="text-xl font-black text-white mb-3">ELO Pairing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Proprietary matchmaking algorithms find perfectly balanced opponents.</p>
          </div>
        </div>

        {/* Small Feature 5 */}
        <div className="relative overflow-hidden p-10 rounded-[32px] bg-[#121213] border border-white/5 hover:border-white/10 transition-colors group flex flex-col justify-between">
          <div className="relative z-10">
            <Crosshair className="text-[#b9a2ff] mb-6" size={28} />
            <h3 className="text-xl font-black text-white mb-3">Spectator Modes</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Watch grandmaster matches live with real-time engine evaluation.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
