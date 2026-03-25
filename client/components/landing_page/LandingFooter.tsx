'use client'

import { Github, Twitter, Mail, Globe, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0b] border-t border-white/5 pt-24 pb-12 overflow-hidden relative">
      {/* Subtle Background Accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-500/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-8 mb-24">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src="/assets/logo1.png" alt="Blitzr Logo" className="h-8 w-auto opacity-90" />
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mb-8">
              The world's most advanced real-time chess arena. Built for grandmasters, accessible to everyone.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://x.com/SinghAshir65848" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#ba9eff]/10 hover:border-[#ba9eff]/20 transition-all">
                <Twitter size={18} />
              </a>
              <a href="https://github.com/Ethan4582" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#ba9eff]/10 hover:border-[#ba9eff]/20 transition-all">
                <Github size={18} />
              </a>
              <a href="mailto:contact@blitzr.com" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#ba9eff]/10 hover:border-[#ba9eff]/20 transition-all">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/lobby" className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Play Arena</Link></li>
              <li><Link href="/watch" className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Spectate Live</Link></li>
              <li><Link href="/leaderboard" className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Global Rankings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="/analysis" className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Engine Analysis</Link></li>
              <li><Link href="/history" className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Game Archives</Link></li>
              
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Community</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Discord Server</a></li>
              <li><a href="#" className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Dev Blog</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
            © {currentYear} Handcrafted by <span className="text-slate-400">Ashirwad</span>. All Rights Reserved.
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80">
                Network Status: Operational
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer group">
              <Globe size={14} className="group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">EN-US</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
