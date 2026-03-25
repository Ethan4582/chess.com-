'use client'

import React from 'react';
import { Trophy, TrendingUp, Zap, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileStats {
  points: number;
  wins: number;
  losses: number;
  draws: number;
  rank?: number;
}

interface StatsCardProps {
  stats: ProfileStats | null;
  loading: boolean;
}

export function StatsCard({ stats, loading }: StatsCardProps) {
  const total = (stats?.wins || 0) + (stats?.losses || 0) + (stats?.draws || 0);
  const winRate = total > 0 ? ((stats!.wins / total) * 100).toFixed(1) : "0";

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-[#131314] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      <StatBox 
        label="Win Rate" 
        value={`${winRate}%`} 
        indicator={<span className="text-emerald-500 text-[9px] font-black group-hover:scale-110 transition-transform">↑ +0.2%</span>}
        progress={Number(winRate)}
        color="from-emerald-500/20"
      />
      <StatBox 
        label="Active Streak" 
        value="12 Days" 
        indicator={<Flame size={14} className="text-[#ba9eff]" fill="currentColor" />}
        progress={75}
        color="from-[#ba9eff]/20"
      />
      <StatBox 
        label="Global Rank" 
        value={stats?.rank ? `#${stats.rank}` : "#---"} 
        indicator={<span className="text-[#ba9eff] text-[9px] font-black uppercase tracking-widest">REAL DATA</span>}
        progress={99}
        color="from-[#ba9eff]/20"
      />
      <StatBox 
        label="Tactical Rating" 
        value={stats?.points || 1000} 
        indicator={<TrendingUp size={14} className="text-[#ba9eff]" />}
        progress={50}
        color="from-blue-500/20"
      />
    </div>
  );
}

function StatBox({ label, value, indicator, progress, color }: { label: string, value: string | number, indicator: React.ReactNode, progress: number, color: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#131314] p-4 md:p-5 rounded-[2rem] flex flex-col justify-between border border-white/[0.03] transition-all hover:border-[#ba9eff]/20 group relative overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-tr ${color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">{label}</p>
          {indicator}
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter leading-none">{value}</span>
          <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 1.5, ease: "circOut" }}
               className="h-full bg-gradient-to-r from-[#ba9eff] to-[#6366f1]"
             />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
