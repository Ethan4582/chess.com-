'use client'

import { Github, Twitter } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-[#0e0e0f] border-t border-white/5 w-full py-12">
      <div className="max-w-screen-2xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Brand & Credit */}
        <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
          <div className="text-xl font-black text-white tracking-tight uppercase">Blitzr</div>
          <div className="text-slate-500 text-[11px] font-medium tracking-wide">
            © 2026 Created by Ashirwad. Blitzr.
          </div>
        </div>

       

        {/* Actions/Socials */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <a href="https://x.com/SinghAshir65848" className="p-2.5 rounded-full bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Twitter size={18} />
            </a>
            <a href="https://github.com/Ethan4582" className="p-2.5 rounded-full bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Github size={18} />
            </a>
          </div>

          <div className="ml-2 flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80">
              ALL SYSTEMS RUNNING
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
