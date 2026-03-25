'use client'

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

interface LandingCTAProps {
  onSignUp: () => void;
}

export default function LandingCTA({ onSignUp }: LandingCTAProps) {
  return (
    <section className="py-24 md:py-40 px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="relative overflow-hidden rounded-[40px] md:rounded-[60px] bg-gradient-to-br from-[#131314] to-[#0a0a0b] border border-white/5 p-8 md:p-24 group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
          
          {/* Noise Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          {/* Abstract Graphic Element */}
          <div className="absolute right-0 top-0 w-full h-full pointer-events-none select-none opacity-20 hidden lg:block">
            <div className="absolute top-1/2 right-12 -translate-y-1/2 w-96 h-96 flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute w-80 h-80 border border-white/5 rounded-[4rem] rotate-12 transition-transform duration-[4s] group-hover:rotate-45" />
                <div className="absolute w-80 h-80 border border-white/10 rounded-[4rem] -rotate-12 transition-transform duration-[4s] group-hover:-rotate-45" />
                <div className="absolute w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full animate-pulse" />
                <svg viewBox="0 0 24 24" className="w-48 h-48 stroke-white/20 fill-none stroke-[0.2]" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 22H5V20H19V22Z" />
                  <path d="M7 20V11H17V20" />
                  <path d="M7 11L12 4L17 11H7Z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-[#ba9eff] mb-8"
            >
              <Sparkles size={12} />
              Final Invitation
            </motion.div>

            <h2 className="text-4xl md:text-7xl font-headline font-black text-white mb-8 leading-[1.1] tracking-tighter">
              Ready to claim your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 italic">Global Dominance?</span>
            </h2>
            
            <p className="text-slate-500 text-lg md:text-xl font-medium mb-12 max-w-xl leading-relaxed">
              Step into the world's most sophisticated arena. No latency, no distractions, just you and your strategist's instinct.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 md:gap-12">
              <button 
                onClick={onSignUp}
                className="group relative px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all hover:translate-y-[-2px] hover:shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Enter The Void
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>

              <div className="grid grid-cols-2 gap-8 md:gap-12">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/5">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-black uppercase tracking-wider">Lag Free</p>
                    <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">Global CDN</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/5">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-black uppercase tracking-wider">Real Time</p>
                    <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">Socket Powered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
