'use client'

import React from 'react';
import { Trophy, TrendingUp, Zap, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileStats {
  points: number;
  wins: number;
  losses: number;
  draws: number;
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
        indicator={<span className="text-[#ba9eff] text-[10px] font-bold">AVG. EFFICIENCY</span>}
      />
      <StatBox 
        label="Active Streak" 
        value={(stats?.wins || 0) > 0 ? `${Math.min(stats!.wins, 5)} Wins` : "0 Games"} 
        indicator={<Flame size={14} className={(stats?.wins || 0) > 0 ? "text-[#c08cf7]" : "text-slate-600"} fill="currentColor" />}
      />
      <StatBox 
        label="Global Rank" 
        value={stats?.points ? `#${Math.max(1, 1000 - Math.floor(stats.points / 2))}` : "#---"} 
        indicator={<span className="text-slate-500 text-[10px] font-bold">ESTIMATED</span>}
      />
      <StatBox 
        label="Tactical Rating" 
        value={stats?.points || 1000} 
        indicator={<span className="text-[#ba9eff] text-[10px] font-bold uppercase tracking-widest">LIVE DATA</span>}
      />
    </div>
  );
}

function StatBox({ label, value, indicator }: { label: string, value: string | number, indicator: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#131314] p-5 rounded-xl flex flex-col justify-between border border-white/[0.03] transition-all hover:bg-[#1a1a1b]"
    >
      <p className="text-slate-500 text-[9px] uppercase tracking-[0.2em] font-black mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-black text-white italic tracking-tighter">{value}</span>
        {indicator}
      </div>
    </motion.div>
  );
}
